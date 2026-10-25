import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('main student screens meet automated WCAG AA checks', async ({ page }) => {
  await page.goto('/');
  for (const screen of [
    'Overview',
    'My planner',
    'Opportunities',
    'Acadia guide',
    'Inbox',
    'Profile & settings',
  ]) {
    if (screen !== 'Overview')
      await page
        .getByRole('button', { name: screen, exact: screen !== 'Acadia guide' })
        .first()
        .click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary?.split('\n').at(-1),
        })),
      })),
      screen,
    ).toEqual([]);
  }
});
