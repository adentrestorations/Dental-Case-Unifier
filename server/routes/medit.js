const express = require('express');
const router = express.Router();
const { loginAndScrapeMeditCases } = require('C:/Users/User/Desktop/BotWIP/dental-case-unifier/server/services/MeditBot.js');

router.get('/cases', async (req, res) => {
  try {
    const cases = await loginAndScrapeMeditCases();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cases from Medit' });
  }
});

module.exports = router;
