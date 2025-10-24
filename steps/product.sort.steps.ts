// steps/product.sort.steps.ts
import { Then } from '@cucumber/cucumber';
import { getPage } from '../playwrightUtilities';

// ---- helpers (scoped to this file) ----
function normalize(label: string) {
  return label.trim().toLowerCase();
}

// Support NAME + PRICE labels
function sortValueFromLabel(label: string): 'az' | 'za' | 'lohi' | 'hilo' {
  const l = normalize(label);
  if (l === 'name (a to z)') return 'az';
  if (l === 'name (z to a)') return 'za';
  if (l === 'price (low to high)') return 'lohi';
  if (l === 'price (high to low)') return 'hilo';
  throw new Error(
    `Unsupported sort label: "${label}". Use "Name (A to Z)", "Name (Z to A)", "Price (low to high)", or "Price (high to low)".`
  );
}

// ACTION: set sort option (single source of truth for this step)
Then('I sort the items by {string}', async function (label: string) {
  const page = getPage();
  await page.waitForSelector('[data-test="product-sort-container"]', { state: 'visible' });
  await page.selectOption('[data-test="product-sort-container"]', sortValueFromLabel(label));
  await page.waitForTimeout(150); // allow DOM reorder
});

// ASSERT: prices sorted (used by the “price” Scenario Outline)
Then(
  'I should see all {int} items sorted correctly by price {string}',
  async function (count: number, label: string) {
    const page = getPage();
    const raw = await page.$$eval('.inventory_item_price', nodes =>
      nodes.map(n => (n.textContent ?? '').trim())
    );

    if (raw.length < count) {
      throw new Error(`Expected at least ${count} items, but found ${raw.length}.`);
    }

    const prices = raw.slice(0, count).map(p => {
      const num = Number(p.replace(/[^0-9.]/g, ''));
      if (Number.isNaN(num)) throw new Error(`Could not parse price "${p}"`);
      return num;
    });

    const wantHiToLo = normalize(label).includes('high to low');
    const expected = [...prices].sort((a, b) => (wantHiToLo ? b - a : a - b));

    const mismatch = prices.findIndex((v, i) => v !== expected[i]);
    if (mismatch !== -1) {
      throw new Error(
        `Prices not sorted for "${label}".\nActual:   [${prices.join(', ')}]\nExpected: [${expected.join(', ')}]`
      );
    }
  }
);
