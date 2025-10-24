import { Page, expect } from '@playwright/test';

export class PurchasePage {
  constructor(private page: Page) {}

  // ----- Selectors -----
  private username = '#user-name';
  private password = '#password';
  private loginBtn = '#login-button';

  private addBackpackBtn = '[data-test="add-to-cart-sauce-labs-backpack"]';
  private cartIcon = '.shopping_cart_link';

  private checkoutBtn = '[data-test="checkout"]';
  private firstName = '[data-test="firstName"]';
  private lastName = '[data-test="lastName"]';
  private postalCode = '[data-test="postalCode"]';
  private continueBtn = '[data-test="continue"]';
  private finishBtn = '[data-test="finish"]';

  private successHeader = '.complete-header';

  // ----- Actions -----
  async open(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async login(username: string, password: string) {
    await this.page.fill(this.username, username);
    await this.page.fill(this.password, password);
    await this.page.click(this.loginBtn);
    await expect(this.page.locator(this.cartIcon)).toBeVisible();
  }

  async addBackpackToCart() {
    await this.page.click(this.addBackpackBtn);
  }

  async openCart() {
    await this.page.click(this.cartIcon);
  }

  async clickCheckout() {
    await this.page.click(this.checkoutBtn);
  }

  async fillCheckoutInfo(first: string, last: string, zip: string) {
    await this.page.fill(this.firstName, first);
    await this.page.fill(this.lastName, last);
    await this.page.fill(this.postalCode, zip);
  }

  async continueCheckout() {
    await this.page.click(this.continueBtn);
  }

  async finishCheckout() {
    await this.page.click(this.finishBtn);
  }

  async expectSuccessMessage(text: string) {
    await expect(this.page.locator(this.successHeader)).toHaveText(text);
  }
}
