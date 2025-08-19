// bots/meditBot.js
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env.shared' }); // adjust path if needed
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

async function printRx(orderId) {
  const browser = await puppeteer.launch({
    headless: false,
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
  }
  catch (err) {
    console.error('❌ Medit scrape error:', err);
    throw err;
  }
  try {
    // Wait for the table of cases to load
    await page.waitForSelector('#checkbox-hide-notice', { visible: true });
    await page.click('#checkbox-hide-notice');
    
    await page.waitForSelector('tr.main-body-tr', { visible: true, timeout: 10000 });

    await page.waitForSelector('tr.main-body-tr', { visible: true, timeout: 10000 });

// Find the row with your orderId
const rows = await page.$$('tr.main-body-tr');
let found = false;

for (const row of rows) {
  const cell = await row.$('td:nth-child(7) span');
  const text = await page.evaluate(el => el.innerText, cell);
  if (text === orderId) {
    await row.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }));
    await row.click();  // Click from Puppeteer context
    console.log(`✅ Clicked row with orderId ${orderId}`);
    found = true;
    break;
  }
}

await delay(500); //half a second






// === 0. Define base folder dynamically ===
const baseFolder = path.join(process.env.USERPROFILE, "Desktop", "Case Automation");

// Make sure folder exists
if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

// 1. Grab order ID and patient name
const ordernum = await page.$eval("#input-order-id", el => el.value);
const patientNameRaw = await page.$eval("#input-patient-name", el => el.value);

// Clean patient name → remove stuff like (OS) and split
const patientName = patientNameRaw.replace(/\(.*?\)/g, "").trim();
const [patientFirst, ...patientRest] = patientName.split(" ");
const patientLast = patientRest.join(" ");

// Hardcoded doctor (you could scrape later if available)
const doctorName = "Krutiben Patel";
const [doctorFirst, ...doctorRest] = doctorName.split(" ");
const doctorLast = doctorRest.join(" ");

// 2. Extract all tooth–procedure pairs
const treatments = await page.$$eval("tr.main-body-tr", rows =>
  rows.map(row => {
    const tooth = row.querySelector("td:nth-child(1) span")?.innerText.trim();
    const procedure = row.querySelector("td:nth-child(2) span")?.innerText.trim();
    return { tooth, procedure };
  }).filter(t => t.tooth && t.procedure) // ignore empty rows
);

// === Write patient info ===
const patientInfoPath = path.join(baseFolder, "patient_info.txt");
const patientInfoContent = `${patientFirst} ${patientLast}\n${doctorFirst} ${doctorLast}`;
fs.writeFileSync(patientInfoPath, patientInfoContent, "utf8");
console.log("✅ Wrote patient_info.txt");

// === Write treatments ===
const treatmentsPath = path.join(baseFolder, "treatments.txt");
const treatmentsContent = treatments.map(t => `${t.tooth},${t.procedure}`).join("\n");
fs.writeFileSync(treatmentsPath, treatmentsContent, "utf8");
console.log("✅ Wrote treatments.txt");








await page.waitForSelector('#btn-case-info-action', { visible: true, timeout: 10000 });

// Click the button
await page.click('#btn-case-info-action');

// Wait for the Print button to appear
const printButton = await page.waitForSelector('#btn-print', { visible: true });

// Click with an offset (x, y pixels from top-left of the element)
await printButton.click({
  offset: { x: 50, y: 10 } // adjust these numbers to hit the safe spot
});

console.log('✅ Clicked the Print button');

await delay(40000);

await page.waitForSelector('#btn-close-print-modal', { visible: true });

// Click the Close button
await page.click('#btn-close-print-modal');

await delay(5000);

await page.waitForSelector('#btn-case-detail', { visible: true });
await page.click('#btn-case-detail');

await delay(5000);

await page.waitForSelector('#btn-casebox-download', { visible: true });
await page.click('#btn-casebox-download');


// Wait for the OK button to appear
await page.waitForSelector('#btn-ok-download-case-file', { visible: true });

// Click the button
await page.click('#btn-ok-download-case-file');

await delay(5000);

await page.waitForSelector('#btn-back-label-case-detail', { visible: true });

console.log("waiting 60 seconds");

   await delay(60000);

   

    await delay(5000); // wait for print dialog to start
  } catch (err) {
    console.error('❌ Print Rx error:', err);
  } finally {
    await browser.close();
  }
}

module.exports = { loginAndScrapeMeditCases, printRx };
