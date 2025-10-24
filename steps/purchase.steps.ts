// steps/purchase.steps.ts
import { Then } from '@cucumber/cucumber';
import { getPage } from '../playwrightUtilities';

// Select the cart icon in the top-right
Then('I select the cart', async function () {
  const page = getPage();
  await page.click('.shopping_cart_link');
});

// Click the Checkout button
Then('I select Checkout', async function () {
  const page = getPage();
  await page.click('[data-test="checkout"]');
});

// Fill the checkout form
Then(
  /^I fill in the First Name "([^"]+)", Last Name "([^"]+)", and Zip\/Postal Code "([^"]+)"$/,
  async function (first: string, last: string, zip: string) {
    const page = getPage();
    await page.fill('[data-test="firstName"]', first);
    await page.fill('[data-test="lastName"]', last);
    await page.fill('[data-test="postalCode"]', zip);
  }
);

// Click Continue
Then('I select Continue', async function () {
  const page = getPage();
  await page.click('[data-test="continue"]');
});

// Click Finish
Then('I select Finish', async function () {
  const page = getPage();
  await page.click('[data-test="finish"]');
});

// Validate the success message
Then('I should see the success message {string}', async function (msg: string) {
  const page = getPage();
  await page.waitForSelector('.complete-header', { state: 'visible' });
  const text = (await page.textContent('.complete-header'))?.trim();
  if (text !== msg) {
    throw new Error(`Expected "${msg}" but got "${text}"`);
  }
});
