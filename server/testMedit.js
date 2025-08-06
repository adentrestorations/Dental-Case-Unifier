require('dotenv').config();

const { loginAndScrapeMeditCases } = require('./services/MeditBot');

(async () => {
  try {
    const cases = await loginAndScrapeMeditCases();
    console.log('Scraped cases:', cases);
  } catch (err) {
    console.error('Test error:', err);
  }
})();