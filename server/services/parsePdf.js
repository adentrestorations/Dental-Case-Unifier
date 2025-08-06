const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ Please provide a PDF file path.");
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);

pdf(buffer).then(data => {
  const text = data.text;
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  const treatments = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match regular treatment lines like: 11Implant BasedFull ContourCeramic: Zirconia-/custom/-
    const match = line.match(/^(\d{1,2})([A-Za-z\s]+):\s*([A-Za-z0-9\- ]+)/);
    if (match) {
      const toothNo = match[1];
      const treatment = match[2].trim();
      const material = match[3].trim();

      treatments.push({
        toothNo,
        treatment,
        material,
        shade: '',
      });
    }

    // 🔄 Moved this OUTSIDE the above if block
    const missingMatch = line.match(/^(\d{1,2})Missing/);
    if (missingMatch) {
      treatments.push({
        toothNo: missingMatch[1],
        treatment: 'Missing (Bridge)',
        material: '',
        shade: ''
      });
    }
  }

  console.log("🦷 Extracted Treatments:");
  console.log(treatments);
});
