// steps/product.extra.steps.ts
import { Then } from '@cucumber/cucumber';
import { getPage } from '../playwrightUtilities';

// ---- small helpers (scoped) ----
const toTexts = async (selector: string) =>
  getPage().$$eval(selector, nodes => nodes.map(n => (n.textContent ?? '').trim()));

const normalize = (s: string) => s.trim().toLowerCase();

function assertSortedString(values: string[], label: string) {
  const wantZtoA = normalize(label).includes('z to a');
  const expected = [...values].sort((a, b) =>
    wantZtoA ? (a > b ? -1 : a < b ? 1 : 0) : (a > b ? 1 : a < b ? -1 : 0)
  );
  const mismatch = values.findIndex((v, i) => v !== expected[i]);
  if (mismatch !== -1) {
    throw new Error(
      `Names not sorted for "${label}".\nActual:   [${values.join(' | ')}]\nExpected: [${expected.join(' | ')}]`
    );
  }
}

// -------- NAME sort assertion (Scenario Outline for names) --------
Then(
  'I should see all {int} items sorted correctly by name {string}',
  async function (count: number, label: string) {
    const titles = (await toTexts('.inventory_item_name')).map(t => t.toLowerCase());
    if (titles.length < count) {
      throw new Error(`Expected at least ${count} items, but found ${titles.length}.`);
    }
    assertSortedString(titles.slice(0, count), label);
  }
);

// -------- Sort options present --------
Then('I should see the sort options:', async function (table) {
  const page = getPage();
  await page.waitForSelector('[data-test="product-sort-container"]', { state: 'visible' });

  const expected: string[] = table.raw().flat();
  const actual = await page.$$eval('[data-test="product-sort-container"] option', opts =>
    opts.map(o => (o as HTMLOptionElement).text.trim())
  );

  for (const label of expected) {
    if (!actual.includes(label)) {
      throw new Error(`Missing sort option "${label}". Actual: ${actual.join(', ')}`);
    }
  }
});

// -------- Add multiple items (unquoted CSV) --------
Then(/^I add items to cart:\s*(.+)$/, async function (itemsCsv: string) {
  const page = getPage();
  const names = itemsCsv.split(',').map(s => s.trim()).filter(Boolean);

  for (const name of names) {
    const card = page.locator('.inventory_item').filter({ hasText: name }).first();
    await card.waitFor({ state: 'visible' });
    const addBtn = card.locator('button:has-text("Add to cart")');
    await addBtn.click();
  }
});

// -------- Cart badge assertions --------
Then('I should see the cart badge count {int}', async function (expected: number) {
  const page = getPage();
  await page.waitForSelector('.shopping_cart_badge', { state: 'visible' });
  const txt = (await page.textContent('.shopping_cart_badge'))?.trim() ?? '';
  const actual = Number(txt);
  if (actual !== expected) {
    throw new Error(`Cart badge mismatch. Expected ${expected}, got ${actual}`);
  }
});

Then('I should see no cart badge', async function () {
  const page = getPage();
  const visible = await page.isVisible('.shopping_cart_badge');
  if (visible) throw new Error('Expected no cart badge, but a badge is visible.');
});

// -------- Price formatting sanity --------
Then('each item price should match the currency format', async function () {
  const prices = await toTexts('.inventory_item_price');
  const re = /^\$\d+\.\d{2}$/;
  const bad = prices.filter(p => !re.test(p));
  if (bad.length) throw new Error(`Invalid price format(s): ${bad.join(', ')}`);
});

// -------- Navigate into first item and back --------
Then('I open the first product details', async function () {
  const page = getPage();
  await page.locator('.inventory_item_name').first().click();
  await page.waitForSelector('.inventory_details_name', { state: 'visible' });
});

Then('I go back to inventory list', async function () {
  const page = getPage();
  await page.click('[data-test="back-to-products"]');
  await page.waitForSelector('.inventory_list', { state: 'visible' });
});

// -------- Visible-order assertion (used for the persistence outline) --------
Then('the inventory should be sorted by {string}', async function (label: string) {
  const l = normalize(label);

  if (l.includes('price')) {
    const pricesText = await toTexts('.inventory_item_price');
    const nums = pricesText.map(p => Number(p.replace(/[^0-9.]/g, '')));
    const wantHiToLo = l.includes('high to low');
    const expected = [...nums].sort((a, b) => (wantHiToLo ? b - a : a - b));
    const mismatch = nums.findIndex((v, i) => v !== expected[i]);
    if (mismatch !== -1) {
      throw new Error(
        `Prices not in expected order for "${label}".\n` +
          `Actual:   [${nums.join(', ')}]\n` +
          `Expected: [${expected.join(', ')}]`
      );
    }
  } else {
    const names = (await toTexts('.inventory_item_name')).map(t => t.toLowerCase());
    const wantZtoA = l.includes('z to a');
    const expected = [...names].sort((a, b) =>
      wantZtoA ? (a > b ? -1 : a < b ? 1 : 0) : (a > b ? 1 : a < b ? -1 : 0)
    );
    const mismatch = names.findIndex((v, i) => v !== expected[i]);
    if (mismatch !== -1) {
      throw new Error(
        `Names not in expected order for "${label}".\n` +
          `Actual:   [${names.join(' | ')}]\n` +
          `Expected: [${expected.join(' | ')}]`
      );
    }
  }
});

// -------- Reset App State --------
Then('I reset app state', async function () {
  const page = getPage();
  await page.click('#react-burger-menu-btn');
  await page.waitForSelector('.bm-item-list', { state: 'visible' });
  await page.click('#reset_sidebar_link');
  await page.click('#react-burger-cross-btn');
  await page.waitForTimeout(150);
});
