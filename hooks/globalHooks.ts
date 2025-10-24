import { Before, After } from '@cucumber/cucumber';
import { initializePage, cleanup } from '../playwrightUtilities';

Before(async function () {
  // toggle HEADLESS=false by running: HEADLESS=false npm run test
  await initializePage(process.env.HEADLESS !== 'false');
});

After(async function () {
  await cleanup();
});
