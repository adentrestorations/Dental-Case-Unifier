const express = require('express');
const router = express.Router();
const { loginAndFetchCases, printRxPage } = require('../services/IteroBot'); // Capital "I" to match file

// Route to fetch iTero cases
router.get('/cases', async (req, res) => {
  try {
    const username = process.env.ITERO_USERNAME;
    const password = process.env.ITERO_PASSWORD;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const cases = await loginAndFetchCases(username, password);
    res.json(cases);
  } catch (error) {
    console.error('Error fetching iTero cases:', error);
    res.status(500).json({ error: 'Failed to fetch iTero cases' });
  }
});

// 🔄 New Route: Open Rx and click "Print Rx"
router.get('/printRx/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    await printRxPage(orderId);
    res.send(`✅ Opened and triggered print for Order ID: ${orderId}`);
  } catch (err) {
    console.error('Error printing Rx page:', err);
    res.status(500).send('❌ Failed to open/print Rx.');
  }
});

module.exports = router;
