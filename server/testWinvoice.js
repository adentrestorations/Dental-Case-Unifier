require('dotenv').config();
const { loginAndFillWinvoice } = require('./services/WinvoiceBot');

(async () => {
  try {
    await loginAndFillWinvoice(process.env.WINVOICE_USERNAME, process.env.WINVOICE_PASSWORD);
    console.log('Login successful');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
