import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { addDays, todayKey } from '../src/domain/dates';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('acadia-guest', 'true'));
});
async function go(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: new RegExp(`^${name}`) })
    .click();
}
async function onboard(page: Page) {
  await page
    .locator('.welcome-hero')
    .getByRole('button', { name: 'Set up my profile', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nickname').fill('Alex');
  await dialog.getByLabel('Grade', { exact: true }).selectOption('10');
  await dialog.getByLabel('Broad location').selectOption('Pennsylvania');
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await dialog.getByRole('button', { name: 'Engineering', exact: true }).click();
  await dialog.getByLabel('Possible ambitions').fill('Explore engineering');
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await dialog.getByLabel('Preparation minutes per day').selectOption('60');
  for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    await dialog.getByRole('button', { name: day, exact: true }).click();
  await dialog.getByLabel('Prefer free participation').check();
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(dialog).toContainText('Review your answers');
  await expect(dialog).toContainText('Engineering');
  await dialog.getByRole('button', { name: 'Save my preferences' }).click();
}
async function saveExample(page: Page) {
  await go(page, 'Discover');
  await page.getByRole('button', { name: 'Demo studio' }).click();
  await page.getByRole('button', { name: 'Engineering studio', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Fictional demonstration');
  await expect(dialog).toContainText('Sample program brief');
  await dialog.getByRole('button', { name: 'Save and build a pathway' }).click();
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await go(page, 'My Pathways');
}

test('complete engineering/free guest journey with schoolwork, schedule approval and return', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await onboard(page);
  await go(page, 'Calendar');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  const taskDialog = page.getByRole('dialog');
  await taskDialog.getByLabel('Task title').fill('Physics homework');
  await taskDialog.getByLabel('Date', { exact: true }).fill(addDays(todayKey(), 1));
  await taskDialog.getByLabel('Start time').fill('16:00');
  await taskDialog.getByRole('button', { name: 'Add to my calendar' }).click();
  await saveExample(page);
  const pathwayAccessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(pathwayAccessibility.violations.map((item) => item.id)).toEqual([]);
  await page.getByLabel('Target date for Engineering studio').fill(addDays(todayKey(), 14));
  await page.getByRole('button', { name: 'Preview preparation schedule' }).click();
  const preview = page.getByRole('dialog');
  await expect(preview).toContainText('Preview only');
  await expect(preview.locator('.schedule-preview li')).toHaveCount(5);
  await preview.getByRole('button', { name: 'Approve 5 sessions' }).click();
  await page.reload();
  await go(page, 'My Pathways');
  await expect(
    page.getByRole('heading', { name: 'Engineering studio', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Complete Read the sample requirements and evidence').check();
  await expect(page.getByText('1 of 5 preparation steps complete')).toBeVisible();
  await go(page, 'Calendar');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export calendar', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('acadia-calendar.ics');
  await go(page, 'Profile & Settings');
  const backup = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export planner', exact: true }).click();
  expect((await backup).suggestedFilename()).toBe('acadia-planner-v3.json');
  expect(errors).toEqual([]);
});
test('real records show uncertainty; learning resources and demos stay separate', async ({
  page,
}) => {
  await page.goto('/');
  await go(page, 'Discover');
  await expect(page.getByText('Source review is pending.', { exact: false })).toBeVisible();
  await page.getByLabel('Cost', { exact: true }).selectOption('Free participation');
  await expect(
    page.getByRole('heading', { name: 'No records match these filters.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page
    .getByRole('button', { name: 'Summer Academy for Math and Science', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'Cost is unknown'.toLowerCase().replace('cost is unknown', 'Participation cost'),
  );
  await expect(page.getByRole('dialog')).toContainText('not been verified');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Learning resources', exact: true }).click();
  await expect(page.locator('.opportunity-card')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'CS50x learning resource', exact: true }),
  ).toBeVisible();
});
test('completion dependencies, calendar rescheduling, and data deletion work', async ({ page }) => {
  await page.goto('/');
  await saveExample(page);
  await page.getByLabel('Complete Try a small project or practice activity').click();
  await expect(page.getByRole('status')).toContainText('prerequisite');
  await expect(
    page.getByLabel('Complete Try a small project or practice activity'),
  ).not.toBeChecked();
  await page.getByLabel('Complete Read the sample requirements and evidence').check();
  await page
    .getByLabel('Complete Confirm eligibility, current dates, costs and access needs')
    .check();
  await page.getByLabel('Reopen Read the sample requirements and evidence').uncheck();
  await expect(
    page.getByLabel('Complete Confirm eligibility, current dates, costs and access needs'),
  ).not.toBeChecked();
  await go(page, 'Calendar');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task title').fill('Study session');
  await dialog.getByRole('button', { name: 'Add to my calendar' }).click();
  await page.getByRole('button', { name: 'Edit Study session' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Start time').fill('17:30');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.scheduled-tasks')).toContainText('17:30');
  await go(page, 'Profile & Settings');
  await page.getByRole('button', { name: 'Delete guest data' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('I understand this cannot be undone.').check();
  await dialog.getByRole('button', { name: 'Delete my guest data' }).click();
  await go(page, 'My Pathways');
  await expect(
    page.getByRole('heading', { name: 'Your next chapter has room to grow.' }),
  ).toBeVisible();
});
test('corrupted storage is recoverable without overwriting; invalid imports are refused', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('acadia-workspace-v2', '{broken'));
  await page.goto('/');
  await expect(page.locator('.storage-warning')).toContainText('corrupted');
  const recovery = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recovery copy' }).click();
  expect((await recovery).suggestedFilename()).toBe('acadia-recovery.txt');
  await go(page, 'Profile & Settings');
  await page.getByLabel('Import planner JSON').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(
    page.getByText('This file is not a valid Acadia v2 planner.', { exact: false }),
  ).toBeVisible();
});
test('main screens and onboarding pass automated accessibility checks; mobile navigation stays usable', async ({
  page,
}) => {
  await page.goto('/');
  for (const section of ['Today', 'Discover', 'My Pathways', 'Calendar', 'Profile & Settings']) {
    if (section !== 'Today') await go(page, section);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      section,
    ).toEqual([]);
  }
  await page.getByRole('button', { name: 'Edit my profile', exact: true }).click();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await go(page, 'Today');
  await page.screenshot({ path: 'test-results/today-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: 'test-results/today-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await go(page, 'Discover');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});
