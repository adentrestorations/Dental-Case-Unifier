// bots/meditBot.js
const puppeteer = require('puppeteer');

const email = process.env.MEDIT_USERNAME;
const password = process.env.MEDIT_PASSWORD;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


if (!email || !password) {
  throw new Error('Missing MEDIT_USERNAME or MEDIT_PASSWORD in your environment variables');
}

async function loginAndScrapeMeditCases() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://www.meditlink.com/login', { waitUntil: 'networkidle2' });

    // Wait for username input
    await page.waitForSelector('#input-login-id');
    await page.type('#input-login-id', email, { delay: 50 });

    // Wait for password input
    await page.waitForSelector('#input-login-password');
    await page.type('#input-login-password', password, { delay: 50 });

    // Wait for login button and click
    await page.waitForSelector('#btn-login');
    await Promise.all([
      page.click('#btn-login'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    console.log('✅ Logged in to Medit');

    // After successful login and page load...
    await page.waitForSelector('#checkbox-hide-notice', { visible: true });
    await page.click('#checkbox-hide-notice');
    console.log('✅ Clicked the "Do not show again" checkbox');

    await delay(3000);

    const rowHandles = await page.$$('tr.main-body-tr');
    console.log(`🪵 Found ${rowHandles.length} <tr.main-body-tr> elements`);
    if (rowHandles.length > 0) {
  const html = await page.evaluate(el => el.innerHTML, rowHandles[0]);
  console.log('🔍 First row inner HTML:\n', html);
}


    const cases = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr.main-body-tr'));
    return rows.map(row => {
        const tds = row.querySelectorAll('td');
        return {
        status: tds[0]?.querySelector('span')?.innerText.trim() || null,
        caseName: tds[1]?.querySelector('span')?.innerText.trim() || null,
        doctorName: tds[2]?.querySelector('span')?.innerText.trim() || null,
        createdAt: tds[3]?.querySelector('span')?.innerText.trim() || null,
        updatedAt: tds[4]?.querySelector('span')?.innerText.trim() || null,
        clinicName: tds[5]?.querySelector('span')?.innerText.trim() || null,
        orderId: tds[6]?.querySelector('span')?.innerText.trim() || null,
        };
    });
    });
const pendingCases = cases.filter(c => c.status?.toLowerCase() === 'pending');
console.log('🟡 Pending cases:', pendingCases);
return pendingCases;
  } catch (err) {
    console.error('❌ Medit scrape error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = { loginAndScrapeMeditCases };
