const express = require('express');
const router = express.Router();

// Placeholder puppeteer route
router.get('/test', (req, res) => {
  res.json({ message: 'Puppeteer endpoint working' });
});

module.exports = router;
