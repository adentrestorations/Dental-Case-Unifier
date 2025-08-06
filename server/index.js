const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/run-automation', (req, res) => {
  const { filePath } = req.body;
  
  exec(`node C:/path/to/your/extractScript.js "${filePath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Automation failed');
    }
    res.send('Automation completed');
  });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
