const puppeteer = require('puppeteer');
const path = require('path');
const { getCombinedWinvoiceData } = require('./WinvoiceHelper');
require('dotenv').config({ path: './.env.shared' }); // adjust path if needed


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function adjustDueDate(dueDateStr) {
    const tempDate = new Date(dueDateStr);
    if (isNaN(tempDate)) throw new Error('Invalid date');
    const day = tempDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const offset = (day >= 1 && day <= 3) ? -5 : -3;
    const adjustedDate = new Date(tempDate);
    adjustedDate.setDate(tempDate.getDate() + offset);
    return adjustedDate;
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // or your actual Chrome path
const PROFILE_PATH = 'C:\\Users\\User\\Desktop\\BotCustomProfile';

async function loginAndFillWinvoice(username, password) {
  const { patient, doctor, teeth, address, dueDate, shades } = await getCombinedWinvoiceData();
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    userDataDir: PROFILE_PATH,
    args: ['--no-default-browser-check', '--disable-popup-blocking'],
    });

    const page = (await browser.pages())[0];
    await page.goto('https://adent.winvoice.com/', { waitUntil: 'domcontentloaded' });


  await page.click('.navbar-burger');

  await page.click('#ctl00_LoginStatus1');
  await page.waitForSelector('#ctl00_cph1_Login1_UserName');

  await page.type('#ctl00_cph1_Login1_UserName', username);
  await page.type('#ctl00_cph1_Login1_Password', password);
  await page.click('#ctl00_cph1_Login1_LoginButton');

  await page.waitForSelector('#ctl00_l_Stats_tb_SuperFind');
  await page.type('#ctl00_l_Stats_tb_SuperFind', patient);
  await page.click('#ctl00_l_Stats_b_SuperFindGo');

  let noInvoices = true;
    try {
    await page.waitForSelector('table#someTableSelector, td[colspan="25"]', { timeout: 2000 });
    } catch (err) {
    console.log('Table not found, falling back to alt logic.');
    noInvoices = false;
    }

//   const noInvoices = await page.evaluate(() => {
//   const cell = document.querySelector('td[colspan="25"]');
//   return cell?.innerText?.includes('No Invoices');
// });


  if (noInvoices) {
    // No invoices found
    await page.goto('https://adent.winvoice.com/Invoices/CreateInvoice.aspx');

    await page.waitForSelector('#ctl00_cph1_tb_patient');
    await page.click('#ctl00_cph1_tb_patient');
    await page.evaluate((a) => {
    document.querySelector('#ctl00_cph1_tb_patient').value = a;
    }, patient);

    await page.click('#ctl00_cph1_tb_due');
    await page.evaluate((b) => {
    document.querySelector('#ctl00_cph1_tb_due').value = b;
    }, dueDate);

    await page.click('#ctl00_cph1_tb_sched');
    await page.evaluate((c) => {
    document.querySelector('#ctl00_cph1_tb_sched').value = c;
    }, adjustDueDate(dueDate).toLocaleDateString());

    await page.click('#ctl00_cph1_ddl_shipto');

    await page.evaluate((doctorName) => {

        function titleCase(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  const select = document.querySelector('#ctl00_cph1_ddl_shipto');
  const options = Array.from(select.options);
  const matchingOption = options.find(o => o.text.trim().startsWith(titleCase(doctorName.trim())));

  // if (doctor === "Vahid Varasteh" && (address.toLowerCase().includes("north"))) {
  //   const newDoctor = "Vahid Varasteh, DMD"
  // }
  // else {
  //   const newDoctor = doctor;
  // }

  if (matchingOption) {
    select.value = matchingOption.value;

    select.onchange && select.onchange();
  }
}, "Dr. " + doctor);

if ((shades[0] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value;
      select.onchange && select.onchange();
    }
  }, shades[0]);
}

if ((shades[1] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade_middle');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value; 
      select.onchange && select.onchange();
    }
  }, shades[1]);
}

if ((shades[2] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade_bottom');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value;
      select.onchange && select.onchange();
    }
  }, shades[2]);
}


// async function handleToothTreatments(page, teeth) {
//   const crowns = [];
//   const implants = [];

//   // Categorize teeth
//   for (const { tooth, treatment } of teeth) {
//     const normalized = treatment.toLowerCase();
//     if (normalized.includes("crown")) {
//       crowns.push(tooth);
//     } else if (normalized.includes("implant")) {
//       implants.push(tooth);
//     }
//   }

//   // --- Handle crowns ---
//   if (crowns.length > 0) {
//     await page.evaluate(() => {
//   const select = document.getElementById('ctl00_cph1_TopSel1');
//   if (select) {
//     // Clear other selections and select "FC Zirkonia single Crown"
//     for (const option of select.options) {
//       option.selected = option.value === '372';
//     }

//     // Trigger onchange to simulate user interaction and cause postback
//     const event = new Event('change', { bubbles: true });
//     select.dispatchEvent(event);
//   }
// });

//     for (const tooth of crowns) {
//       await selectToothByNumber(page, tooth);
//     }
//   }

//   // --- Handle implants ---
//   if (implants.length > 0) {
//     // TODO: Click the implant option on the page
//     // await page.click('selector-for-implant-option');

//     for (const tooth of implants) {
//       await selectToothByNumber(page, tooth);
//     }
//   }
// }

// // Dummy function you should replace with your own logic
// async function selectToothByNumber(page, toothNumber) {
//   // This should select the correct tooth element on the page
//   console.log(`Selecting tooth ${toothNumber}`);
//   // Example:
//   // await page.click(`[data-tooth-number="${toothNumber}"]`);
// }

await page.click('#ctl00_cph1_b_SaveAndPrint');



    } else {
    // Invoices found
    // Extract invoice number of first row - adjust selector as needed
    // const firstInvoiceNumber = await page.$eval('table#someTableSelector tbody tr:first-child td.invoiceNumberColumnSelector', el => el.innerText.trim());
    await delay(500);

    await page.click('input#ctl00_cph1_gv1_ctl02_CBB');

    await delay(500);
    await page.waitForSelector('input#ctl00_cph1_b_Edit2');
    await page.click('input#ctl00_cph1_b_Edit2');
    await delay(500);

await page.waitForSelector('#ctl00_cph1_l_InvoiceID', { timeout: 2500 });
const invoiceId = await page.$eval('#ctl00_cph1_l_InvoiceID', el => el.textContent.trim());

    await delay(500);

    await page.goto('https://adent.winvoice.com/Invoices/CreateInvoice.aspx');
    await page.waitForSelector('#ctl00_cph1_b_Copy');
    await page.click('#ctl00_cph1_b_Copy');

    await delay(500);

    await page.waitForSelector('#ctl00_cph1_tb_Copy');
    await page.type('#ctl00_cph1_tb_Copy', invoiceId);

    await page.click('#ctl00_cph1_b_Copy_Continue');

    await delay(500);

    await page.click('#ctl00_cph1_tb_due');
    await page.evaluate((b) => {
    document.querySelector('#ctl00_cph1_tb_due').value = b;
    }, dueDate);

    await delay(500);

    await page.click('#ctl00_cph1_tb_sched');
    await page.evaluate((c) => {
    document.querySelector('#ctl00_cph1_tb_sched').value = c;
    }, adjustDueDate(dueDate).toLocaleDateString());

    await page.click('#ctl00_cph1_ddl_shipto');

    await page.evaluate((doctorName) => {

        function titleCase(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  const select = document.querySelector('#ctl00_cph1_ddl_shipto');
  const options = Array.from(select.options);
  const matchingOption = options.find(o => o.text.trim().startsWith(titleCase(doctorName.trim())));

  if (matchingOption) {
    select.value = matchingOption.value;

    select.onchange && select.onchange();
  }
}, "Dr. " + doctor);

await page.click('#ctl00_cph1_tb_tray');
await page.evaluate(() => {
  document.querySelector('#ctl00_cph1_tb_tray').value = '';
});


if ((shades[0] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value;
      select.onchange && select.onchange();
    }
  }, shades[0]);
}

if ((shades[1] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade_middle');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value; 
      select.onchange && select.onchange();
    }
  }, shades[1]);
}

if ((shades[2] !== "-")) {
    await page.evaluate((shadeName) => {
    const select = document.querySelector('#ctl00_cph1_ddl_shade_bottom');
    const options = Array.from(select.options);
    const matchingOption = options.find(o => o.text.trim().startsWith(shadeName.trim()));

    if (matchingOption) {
      select.value = matchingOption.value;
      select.onchange && select.onchange();
    }
  }, shades[2]);
}

await page.click('#ctl00_cph1_b_SaveAndPrint');
}
}



module.exports = { loginAndFillWinvoice };
