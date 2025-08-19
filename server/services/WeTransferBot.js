import { chromium } from 'playwright';

(async () => {
  // Path to your Chrome/Edge user profile
  // You can find it in:
  // Chrome: C:\Users\<YourUser>\AppData\Local\Google\Chrome\User Data\Default
  // Edge: C:\Users\<YourUser>\AppData\Local\Microsoft\Edge\User Data\Default
  // Edge: C:\Users\User\AppData\Local\Microsoft\Edge\User Data\Default
  const userDataDir = 'C:/Users/User/AppData/Local/Microsoft/Edge/User Data/Default';

  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,       // See what happens
    viewport: null,        // Keep your normal browser size
  });

  const page = await browser.newPage();

  // Go to Wetransfer
  await page.goto('https://wetransfer.com', { waitUntil: 'load' });
  console.log('Page loaded');

  // Click "Log in" link (if needed)
  const loginButton = await page.$('a[data-testid="Log in"]');
  if (loginButton) {
    await loginButton.click();
    await page.waitForTimeout(2000); // Give page time to load
  }

  console.log('Ready to interact as logged-in user.');

  // From here you can interact with transfers normally
  // e.g., list available transfers, click buttons, etc.

})();
