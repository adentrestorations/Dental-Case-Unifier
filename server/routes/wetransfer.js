const express = require('express');
const router = express.Router();
const { loginToWeTransfer } = require('../services/WeTransferBot');

router.get('/cases', async (req, res) => {
  try {
    const emails = await fetchWeTransferEmails();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch WeTransfer emails' });
  }
});

module.exports = router;
