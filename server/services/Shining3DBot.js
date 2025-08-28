const puppeteer = require('puppeteer');
require('dotenv').config();
const path = require('path');
const os = require('os');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('Loaded SHINING_USERNAME:', process.env.SHINING_USERNAME);


async function loginAndFetchShiningCases(username, password) {
  console.log('loginAndFetchShiningCases called with:', { username, password });

  if (typeof username !== 'string' || username.length === 0) {
    throw new Error('Invalid username provided');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Invalid password provided');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  // Hide webdriver flag for anti-bot detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Set user agent to avoid detection
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  try {
    await page.goto('https://s.dental3dcloud.com/p/index?dental_reditect=/u/cases', { waitUntil: 'networkidle2' });

    // Wait for cookies banner then click accept if possible
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const cookieButtonSelector = 'button.xl-button.xl-button__primary span span[style*="color: var(--oem-default-color)"]';
      await page.waitForSelector(cookieButtonSelector, { visible: true, timeout: 10000 });
      await page.click(cookieButtonSelector);
      console.log('Clicked Accept Cookies button.');
    } catch {
      console.log('Accept Cookies button not found or not clickable, skipping...');
    }

    // Login form
    await page.waitForSelector('input.el-input__inner[placeholder*="phone number"], input.el-input__inner[placeholder*="email"]', { visible: true });
    await page.type('input.el-input__inner[placeholder*="phone number"], input.el-input__inner[placeholder*="email"]', username, { delay: 50 });

    await page.waitForSelector('input.el-input__inner[type="password"]', { visible: true });
    await page.type('input.el-input__inner[type="password"]', password, { delay: 50 });

    console.log('Clicking Sign In...');
    await page.click('button.xl-button.xl-button__primary.login-btn');

    console.log('Waiting for cases table...');
    await page.waitForSelector('table tbody tr', { timeout: 60000 });
    console.log('Cases table loaded.');

    // Find and click 'Pending' tab
    await page.waitForSelector('span.xl-tabs-title', { visible: true });
    const pendingTabs = await page.$$('span.xl-tabs-title');
    let pendingTab = null;

    for (const tab of pendingTabs) {
      const textHandle = await tab.getProperty('textContent');
      const text = await textHandle.jsonValue();
      if (text.trim() === 'Pending') {
        pendingTab = tab;
        break;
      }
    }

    if (pendingTab) {
      await pendingTab.click();
      console.log("Clicked 'Pending' tab.");
      await page.waitForSelector('table tbody tr'); // Wait for table rows to load
    } else {
      console.log("'Pending' tab not found.");
    }

    await delay(3000); // extra wait to ensure rows load

    const caseData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const dataRows = rows.filter(row => row.querySelectorAll('td').length >= 10);
      const cases = dataRows.map(row => {
        const cols = row.querySelectorAll('td');
        return {
          receivedDate: cols[0]?.innerText.trim() || '',
          doctorEmail: cols[1]?.innerText.trim() || '',
          practice: cols[2]?.innerText.trim() || '',
          procedure: cols[3]?.innerText.trim() || '',
          patientName: cols[4]?.innerText.trim() || '',
          doctorName: cols[5]?.innerText.trim() || '',
          orderId: cols[7]?.innerText.trim() || '',
          status: cols[9]?.innerText.trim() || '',
        };
      });
      const showThisManyCases = 5; // change this to however many cases you wish to show for Shining3D
      return cases.slice(0, showThisManyCases);
    });

    return caseData;  // <--- Return the data!

  } catch (err) {
    throw err;
  } finally {
    await browser.close();  // Always close the browser
  }
}

async function downloadShining3DCase(caseId) {
  // Assume page is already logged in and on the Pending tab
async function clickCaseByDate(page, targetDate) {
  // Wait for the table rows
  await page.waitForSelector('tr.el-table__row', { visible: true });

  // Find the row index with the matching date
  const rowIndex = await page.evaluate((targetDate) => {
    const rows = Array.from(document.querySelectorAll('tr.el-table__row'));
    for (let i = 0; i < rows.length; i++) {
      const dateCell = rows[i].querySelector('td');
      const dateText = dateCell?.innerText.trim();
      if (dateText && dateText.startsWith(targetDate)) { // match YYYY-MM-DD
        return i;
      }
    }
    return -1;
  }, targetDate);

  if (rowIndex === -1) {
    console.log(`No case found for date: ${targetDate}`);
    return false;
  }

  // Click the matching row
  const rows = await page.$$('tr.el-table__row');
  await rows[rowIndex].click();
  console.log(`Clicked case row for date: ${targetDate}`);
  return true;
}
  const username = process.env.SHINING_USERNAME;
  const password = process.env.SHINING_PASSWORD;

  const browser = await puppeteer.launch({
  headless: false, // so you can see it
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized', // start Chrome maximized
  ],
  defaultViewport: null, // important to use full window size
});
const page = await browser.newPage();

  // Optional: set a download folder
  const client = await page.target().createCDPSession();
  const downloadPath1 = path.join(os.homedir(), 'Downloads');
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadPath1 });

  try {
    // --- Login ---
    await page.goto('https://s.dental3dcloud.com/p/index?dental_reditect=/u/cases', { waitUntil: 'networkidle2' });
    // Wait for cookies banner then click accept if possible
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const cookieButtonSelector = 'button.xl-button.xl-button__primary span span[style*="color: var(--oem-default-color)"]';
      await page.waitForSelector(cookieButtonSelector, { visible: true, timeout: 10000 });
      await page.click(cookieButtonSelector);
      console.log('Clicked Accept Cookies button.');
    } catch {
      console.log('Accept Cookies button not found or not clickable, skipping...');
    }

    // Login form
    await page.waitForSelector('input.el-input__inner[placeholder*="phone number"], input.el-input__inner[placeholder*="email"]', { visible: true });
    await page.type('input.el-input__inner[placeholder*="phone number"], input.el-input__inner[placeholder*="email"]', username, { delay: 50 });

    await page.waitForSelector('input.el-input__inner[type="password"]', { visible: true });
    await page.type('input.el-input__inner[type="password"]', password, { delay: 50 });

    console.log('Clicking Sign In...');
    await page.click('button.xl-button.xl-button__primary.login-btn');

    await delay(8000);

    const targetDate = '2025-08-26'; // match just the YYYY-MM-DD part
await clickCaseByDate(page, targetDate);

await delay(3000);

await page.waitForSelector('span.xl-tabs-title', { visible: true });

const tabs = await page.$$('span.xl-tabs-title');
for (const tab of tabs) {
  const text = await (await tab.getProperty('textContent')).jsonValue();
  if (text.trim() === 'Download') {
    await tab.click();
    console.log("Clicked the 'Download' tab.");
    break;
  }
}

await delay(3000);

const items = await page.$$('.v-list-item.detailDown-item');

for (const item of items) {
  // Check the file type
  const typeSpan = await item.$('span.detailDownType');
  if (typeSpan) {
    const typeText = await page.evaluate(el => el.textContent.trim(), typeSpan);
    if (typeText.toLowerCase().includes('ply')) {
      // Click the download button inside this item
      const downloadBtn = await item.$('i.dwon-btn');
      if (downloadBtn) {
        await downloadBtn.click();
        console.log('Clicked download for PLY file.');
      }
      break; // Stop after finding the first PLY
    }
  }
}

await delay(20000);

await delay(2000);
const labs = await page.$$('span.xl-tabs-title');
for (const tab of labs) {
  const text = await (await tab.getProperty('textContent')).jsonValue();
  if (text.trim() === 'Details') {
    await tab.click();
    console.log("Clicked the 'Details' tab.");
    break;
  }
}

await delay(2000);
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('div.dt-btn.shbg')].find(el => el.textContent.trim() === 'Confirm Case');
  if (btn) btn.click();
});

await delay(2000);
await page.evaluate(() => {
  const icon = document.querySelector('i.icon-dayin3.isButton.xl-icon.icon.iconfont.el-tooltip__trigger');
  if (icon) icon.click();
});


// await page.waitForSelector('i.icon-dayin3.isButton', { visible: true });
// await page.click('i.icon-dayin3.isButton');

// await delay(3000);

  } catch (err) {
    console.error('Error in downloadShining3DCase:', err);
    throw err;
  } finally {
    // await browser.close(); // keep open while testing clicks
  }
}

module.exports = { loginAndFetchShiningCases, downloadShining3DCase };
