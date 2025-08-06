const { loginAndFetchShiningCases } = require('./services/Shining3DBot');
require('dotenv').config();

(async () => {
  try {
    const username = process.env.SHINING_USERNAME;
    const password = process.env.SHINING_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing SHINING_USERNAME or SHINING_PASSWORD in .env');
    }

    const cases = await loginAndFetchShiningCases(username, password);
    console.log('Cases:', cases);
  } catch (err) {
    console.error('Error fetching Shining3D cases:', err);
  }
})();
