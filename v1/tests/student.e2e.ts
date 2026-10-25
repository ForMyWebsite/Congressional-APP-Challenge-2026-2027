import { test, expect } from '@playwright/test';

test('student can plan, save, ask for guidance, and persist demo data', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A little progress/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/acadia-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Add a task' }).click();
  await page.getByLabel('What would you like to do?').fill('Practice interview questions');
  await page.getByLabel('Subject or focus').fill('Career');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByLabel('Practice interview questions')).not.toBeChecked();
  await page.getByLabel('Practice interview questions').check();
  await page.reload();
  await expect(page.getByLabel('Practice interview questions')).toBeChecked();
  await page.getByRole('button', { name: 'Opportunities', exact: true }).click();
  await page
    .getByRole('button', { name: 'Save Turn your big idea into an app', exact: true })
    .click();
  await page.getByRole('button', { name: 'Saved (1)' }).click();
  await expect(page.getByRole('heading', { name: 'Turn your big idea into an app' })).toBeVisible();
  await expect(page.locator('.opportunity-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'My planner', exact: true }).click();
  await page.getByRole('button', { name: 'Add event', exact: true }).click();
  await page.getByLabel('Event name').fill('Counselor check-in');
  await page.getByLabel('Location').fill('Guidance office');
  await page.getByRole('button', { name: 'Add event', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Counselor check-in' })).toBeVisible();
  await page.getByRole('button', { name: 'Acadia guide', exact: false }).first().click();
  await page.getByRole('button', { name: 'When is my PSAT?' }).click();
  await expect(page.locator('.chat-messages')).toContainText('Confirm PSAT/SAT registration');
  expect(errors).toEqual([]);
});

test('profile changes update recommendations and data can be exported', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Profile & settings' }).click();
  await page.getByLabel('Your name').fill('Sam Rivera');
  await page.getByRole('button', { name: 'Social impact', exact: true }).click();
  await page.getByRole('button', { name: 'Save my profile' }).click();
  await expect(page.locator('.sidebar-profile')).toContainText('Sam Rivera');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('acadia-student-data.json');
  await page.reload();
  await expect(page.locator('.sidebar-profile')).toContainText('Sam Rivera');
});

test('account onboarding, persistence, sign in and deletion', async ({ page }) => {
  const email = `student-${Date.now()}@example.com`;
  await page.goto('/');
  await page.getByRole('button', { name: 'Create your free account' }).click();
  await page.getByLabel('Your name').fill('Jordan Lee');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('test-only-password-123');
  await page.getByRole('button', { name: 'Create my workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Let’s get to know you.' })).toBeVisible();
  await page.getByLabel('School', { exact: false }).fill('Test school');
  await page.getByRole('button', { name: 'Engineering', exact: true }).click();
  await page.getByRole('button', { name: 'Save my profile' }).click();
  await expect(page.getByText('All changes saved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).last().click();
  await page.getByRole('button', { name: 'Create your free account' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('test-only-password-123');
  await page.getByRole('button', { name: 'Welcome back' }).click();
  await expect(page.getByRole('heading', { name: /A little progress/ })).toBeVisible();
  await expect(page.locator('.sidebar-profile')).toContainText('Jordan Lee');
  await expect(page.locator('.task-list .task-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Profile & settings' }).click();
  await page.getByRole('button', { name: 'Delete account', exact: true }).click();
  await page.getByLabel('Confirm your password').fill('test-only-password-123');
  await page.getByLabel('I understand this action cannot be undone.').check();
  await page.getByRole('button', { name: 'Permanently delete account' }).click();
  await expect(page.getByRole('button', { name: 'Create your free account' })).toBeVisible();
});

test('mobile has no horizontal overflow and supports navigation and dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A little progress/ })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: 'test-results/acadia-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('button', { name: 'My planner', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your plans, in perspective.' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.getByRole('button', { name: 'Add event', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
