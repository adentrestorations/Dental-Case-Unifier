const express = require('express');
const router = express.Router();
const { loginAndScrapeMeditCases, PrintRx } = require("../services/MeditBot.js");

router.get('/cases', async (req, res) => {
  try {
    const cases = await loginAndScrapeMeditCases();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cases from Medit' });
  }
});

router.post('/print', async (req, res) => {
  const { orderId } = req.body; // send { "orderId": "12345" } from frontend
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  try {
    await printRx(orderId);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ printRx error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
