require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://adent.winvoice.com/');

  await page.click('#ctl00_LoginStatus1');
  await page.waitForSelector('#ctl00_cph1_Login1_UserName');

  await page.type('#ctl00_cph1_Login1_UserName', process.env.WINVOICE_USERNAME);
  await page.type('#ctl00_cph1_Login1_Password', process.env.WINVOICE_PASSWORD);
})();
