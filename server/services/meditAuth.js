const axios = require('axios');
require('dotenv').config();

let tokenCache = null;

async function getMeditToken() {
  if (tokenCache) {
    return tokenCache;
  }

  try {
    const response = await axios.post('https://api.meditlink.com/v1/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
    });

    tokenCache = response.data.access_token;

    // Clear token cache after ~1 hour
    setTimeout(() => {
      tokenCache = null;
    }, 3500 * 1000);

    return tokenCache;
  } catch (error) {
    console.error('Error fetching Medit access token:', error.response?.data || error.message);
    throw new Error('Medit authentication failed');
  }
}

module.exports = getMeditToken;
