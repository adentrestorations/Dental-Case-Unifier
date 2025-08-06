require('dotenv').config();
const { loginAndFetchCases } = require('./services/IteroBot');

(async () => {
  try {
    const cases = await loginAndFetchCases(process.env.ITERO_USERNAME, process.env.ITERO_PASSWORD);
    console.log('Fetched cases:', cases);
  } catch (err) {
    console.error('Test error:', err);
  }
})();
