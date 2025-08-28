const express = require('express');
const router = express.Router();
const { loginAndFetchShiningCases } = require('../services/Shining3DBot');
// const { triggerShining3DPrintRx } = require('../services/Shining3DPrintBot'); // You’ll implement this

router.get('/cases', async (req, res) => {
    console.log('Shining3D /cases route called');
  try {
    const username = process.env.SHINING_USERNAME;
    const password = process.env.SHINING_PASSWORD;

    console.log("Calling loginAndFetchShiningCases with:", { username, password });

    const data = await loginAndFetchShiningCases(username, password);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Shining3D cases:', err);
    res.status(500).json({ error: 'Failed to fetch Shining3D cases.' });
  }
});

const { downloadShining3DCase } = require('../services/Shining3DBot');

router.post('/download', async (req, res) => {
  const { caseId } = req.body;
  try {
    const path = await downloadShining3DCase(caseId);
    res.json({ success: true, path });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/printRx/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    // await triggerShining3DPrintRx(orderId); // Needs to launch Puppeteer
    res.sendStatus(200);
  } catch (err) {
    console.error('Error triggering Shining3D printRx:', err);
    res.status(500).json({ error: 'Failed to trigger Print Rx.' });
  }
});

module.exports = router;
