const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');



function parseName(name) {
  const parts = name.split(',').map(part => part.trim());
  if (parts.length === 2) {
    const first = parts[1][0].toUpperCase() + parts[1].slice(1).toLowerCase();
    const last = parts[0][0].toUpperCase() + parts[0].slice(1).toLowerCase();
    return `${first} ${last}`;
  }
  return name;
}

router.post('/run-case', async (req, res) => {
  try {
    const { patientName, doctorName } = req.body;
    const formattedPatient = parseName(patientName);
    const formattedDoctor = parseName(doctorName);

    const filePath = 'C:/Users/User/Desktop/Case Automation/patient_info.txt';
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${formattedPatient}\n${formattedDoctor}`, 'utf-8');

    exec('"C:\\Program Files\\AutoHotkey\\AutoHotkey.exe" "C:\\Users\\User\\Desktop\\3ShapeAutomation.ahk"', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ AHK Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to run AHK script' });
      }
      return res.json({ success: true, message: 'Automation started successfully' });
    });
  } catch (err) {
    console.error('❌ Route Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
