const express = require('express');
const path = require('path');
const router = express.Router();

const downloadsDir = path.resolve(__dirname, '../downloads'); // adjust if needed

router.get('/itero/download/:orderId', (req, res) => {
  const { orderId } = req.params;
  const filePath = path.join(downloadsDir, `${orderId}.zip`); // assuming .zip files named by orderId

  res.download(filePath, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(404).send('File not found');
    }
  });
});

module.exports = router;
