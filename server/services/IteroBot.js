const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toTitleCase(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function waitForSelectorWithPolling(page, selector, timeout = 15000, interval = 200) {
  const maxTime = Date.now() + timeout;

  while (Date.now() < maxTime) {
    const elementHandle = await page.$(selector);
    if (elementHandle) {
      // Check visibility
      const visible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, elementHandle);

      if (visible) return elementHandle;
    }
    await delay(interval);
  }

  throw new Error(`Either no new cases or timeout waiting for selector: ${selector}`);
}

async function loginAndFetchCases(username, password) {
  const browser = await puppeteer.launch({
    headless: 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://bff.cloud.myitero.com/login-legacy', { waitUntil: 'networkidle2' });

    await page.type('input[name="LoginControl$UserName"]', username, { delay: 10 });
    await page.type('input[name="LoginControl$Password"]', password, { delay: 10 });

    await Promise.all([
      page.click('#btn-login'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    await page.goto('https://bff.cloud.myitero.com/labs/home', { waitUntil: 'networkidle2' });

    try {
      await waitForSelectorWithPolling(page, 'table tbody tr', 15000);
    } 
    catch (err) {
      console.log('No rows found, returning empty array');
      await browser.close();
      return [];
    }

    let noCases = false;
    try {
      await page.waitForFunction(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return rows.length > 0 && !rows[0].innerText.includes('No matches');
      }, { timeout: 15000 });
    } catch (err) {
      noCases = true;
    }

    if (noCases) {
      console.log('✅ Logged in successfully, but no cases found.');
      await browser.close();
      return [];
    }

    const caseData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map((row) => {
        const orderId = row.querySelector('th.col-order-id div')?.innerText || '';
        const patientName = row.querySelector('td.col-patient-name div')?.innerText || '';
        const doctor = row.querySelector('td.col-doctor-name div')?.innerText || '';
        const practice = row.querySelector('td.col-practice-name div')?.innerText || '';
        const procedure = row.querySelector('td.col-case-type-description')?.innerText || '';
        const dueDate = row.querySelector('td.col-due-date')?.innerText || '';
        const receivedDate = row.querySelector('th.col-received div')?.innerText || '';
        const status = row.querySelector('td.col-status')?.innerText || '';

        return {
          orderId,
          patientName,
          doctor,
          practice,
          procedure,
          dueDate,
          receivedDate,
          status,
          downloadLink: `/api/itero/download/${orderId}`,
        };
      });
    });

    await browser.close();
    return caseData;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function printRxPage(orderId) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const username = process.env.ITERO_USERNAME;
  const password = process.env.ITERO_PASSWORD;

  try {
    // 1. Login
    await page.goto('https://bff.cloud.myitero.com/login-legacy', { waitUntil: 'networkidle2' });
    await page.type('input[name="LoginControl$UserName"]', username, { delay: 50 });
    await page.type('input[name="LoginControl$Password"]', password, { delay: 50 });
    await Promise.all([
      page.click('#btn-login'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // 2. Go to dashboard and wait for rows
    await page.goto('https://bff.cloud.myitero.com/labs/home', { waitUntil: 'networkidle2' });
    await page.waitForSelector('table tbody tr', { visible: true, timeout: 15000 });

    // 3. Find the row for the orderId and click the checkbox
    const rows = await page.$$('table tbody tr');
    let checkboxClicked = false;

    for (const row of rows) {
      const idCell = await row.$('th.col-order-id div');
      if (!idCell) continue;
      const text = await page.evaluate(el => el.textContent.trim(), idCell);
      if (text === orderId) {
        console.log(`✅ Found row for orderId ${orderId}`);

          const patientDiv = await row.$('td.col-patient-name div');
          const doctorDiv = await row.$('td.col-doctor-name div');

          const patientName = patientDiv
            ? await page.evaluate(el => el.textContent.trim(), patientDiv)
            : 'Unknown Patient';
          const doctorName = doctorDiv
            ? await page.evaluate(el => el.textContent.trim(), doctorDiv)
            : 'Unknown Doctor';

          console.log(`👤 Patient: ${patientName}`);
          console.log(`🧑‍⚕️ Doctor: ${doctorName}`);

          const parseName = (name) => {
            const parts = name.split(',').map(part => part.trim());
            if (parts.length === 2) {
              return `${parts[1]} ${parts[0]}`;  // "Hooshang Poor"
            }
            return name; // fallback if unexpected format
          };

          let formattedPatientName = parseName(patientName);
          let formattedDoctorName = toTitleCase(parseName(doctorName));

          if (formattedDoctorName === "Xinyan Liu") {
            formattedDoctorName = "Xinyan Lucy Liu";
          }

          const filePath = 'C:/Users/User/Desktop/Case Automation/patient_info.txt';
          fs.mkdirSync(path.dirname(filePath), { recursive: true }); // Ensure folder exists
          fs.writeFileSync(filePath, `${formattedPatientName}\n${formattedDoctorName}`, 'utf-8');

        const checkboxTh = await row.$('th.col-selected-rows');
        const checkboxInput = await checkboxTh?.$('input[type=checkbox]');
        if (!checkboxInput) throw new Error('❌ Checkbox not found');

        await page.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }), checkboxInput);
        await checkboxInput.click();
        console.log('🖱️ Clicked checkbox');
        checkboxClicked = true;
        break;
      }
    }

    if (!checkboxClicked) throw new Error(`❌ Could not find checkbox for Order ID ${orderId}`);

    // 4. Click the "Print Rx" button
    await page.waitForSelector('button#print-cases-btn:not([disabled])', { visible: true, timeout: 10000 });
    const printRxBtn = await page.$('button#print-cases-btn');
    await page.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }), printRxBtn);
    await printRxBtn.click();
    console.log('🖱️ Clicked Print Rx button');

    // 5. Let the user manually trigger the system print dialog
    console.log('🖨️ Waiting for system print dialog to close and dashboard to return...');
    await page.waitForSelector('#export-cases-btn', { visible: true, timeout: 60000 });

    // Wait until the Download Scan button is enabled and visible
    await page.waitForFunction(() => {
      const btn = document.querySelector('#export-cases-btn');
      return btn && !btn.disabled && btn.offsetParent !== null;
    }, { timeout: 60000 });

    console.log('✅ Download Scan button is now enabled');

    // 6. Click the Download Scan button
    const downloadScanBtn = await page.$('#export-cases-btn');
    await page.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }), downloadScanBtn);
    await downloadScanBtn.click();
    console.log('📥 Clicked Download Scan button');

    // Wait for the Download button to appear and be enabled
    await page.waitForSelector('button#export-btn:not([disabled])', { visible: true, timeout: 60000 });
    await page.waitForFunction(() => {
      const btn = document.querySelector('button#export-btn');
      return btn && !btn.disabled && btn.offsetParent !== null;
    }, { timeout: 60000 });

    console.log('✅ Download button is now enabled');

    // 7. Click the Download button
    const downloadBtn = await page.$('button#export-btn');
    await page.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }), downloadBtn);
    await downloadBtn.click();
    console.log('📥 Clicked Download button');

    // Wait for download to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Do not close browser automatically so you can manually handle print dialog or debugging
    // await browser.close();

    return `✅ Finished: Printed and downloaded scan for order ID: ${orderId}`;
  } catch (err) {
    console.error('❌ Error in printRxPage:', err);
    await browser.close();
    throw err;
  }
}

module.exports = {
  loginAndFetchCases,
  printRxPage,
};