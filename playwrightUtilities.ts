// playwrightUtilities.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

export async function initializePage(headless = true) {
  browser = await chromium.launch({ headless, args: ['--disable-dev-shm-usage'] });
  context = await browser.newContext();
  page = await context.newPage();
}

export function getPage(): Page {
  if (!page) throw new Error('Page has not been initialized. Please call initializePage first.');
  return page;
}

export async function cleanup() {
  await context?.close();
  await browser?.close();
  page = null;
  context = null;
  browser = null;
}
