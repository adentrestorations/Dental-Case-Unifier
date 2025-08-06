const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

function getMostRecentPDFInRecentFolders(downloadsDir, days = 1) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  let pdfFiles = [];

  // Get all items in Downloads
  const items = fs.readdirSync(downloadsDir, { withFileTypes: true });

  for (const item of items) {
    const itemPath = path.join(downloadsDir, item.name);
    const stats = fs.statSync(itemPath);

    if (item.isDirectory() && stats.mtimeMs > cutoff) {
      // This folder was modified recently, search inside
      const subItems = fs.readdirSync(itemPath);

      for (const file of subItems) {
        const filePath = path.join(itemPath, file);
        if (!filePath) {
  console.log('No recent PDF found to read.');
  process.exit(1);
}
        if (file.toLowerCase().endsWith('.pdf')) {
          const fileStats = fs.statSync(filePath);
          pdfFiles.push({ path: filePath, mtime: fileStats.mtimeMs });
        }
      }
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.pdf') && stats.mtimeMs > cutoff) {
      // Also include PDFs directly in Downloads if they are recent
      pdfFiles.push({ path: itemPath, mtime: stats.mtimeMs });
    }
  }

  if (pdfFiles.length === 0) {
    console.log('No recent PDFs found in recent folders.');
    return null;
  }

  // Sort by modification time, newest first
  pdfFiles.sort((a, b) => b.mtime - a.mtime);

  return pdfFiles[0].path;
}

const downloadsDir = path.join(require('os').homedir(), 'Downloads');
const filePath = getMostRecentPDFInRecentFolders(downloadsDir, 1); // last 1 day

const namesFile = "C:\\Users\\User\\Desktop\\Case Automation\\patient_info.txt"
const treatmentsFile = "C:\\Users\\User\\Desktop\\Case Automation\\treatments.txt"

async function parsePDF(filePath) {

function extractShades(shadeString) {
  // Try to find a pattern like "-/C1/-"
  const match = shadeString.match(/-?\s*\/\s*-?\s*\/\s*-?/);
  if (!match) {
    // Try broader match, like: "-/C1/-"
    const parts = shadeString.split('/');
    if (parts.length === 3) {
      const [incisal, body, gingival] = parts.map(p => p.trim());

      // If all three are valid date components (e.g. 08/04/2025), then it's probably a date
      const isDate =
        /^\d+$/.test(incisal) &&
        /^\d+$/.test(body) &&
        /^\d+$/.test(gingival) &&
        !isNaN(Date.parse(`${body}/${incisal}/${gingival}`));

      if (isDate) {
        return ['-', '-', '-']; // It's a date, not a shade
      }

      return [incisal || '-', body || '-', gingival || '-'];
    }
  }

  return ['-', '-', '-'];
}







  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text;

  const addressMatch = text.match(/Ship to Address:\s*([^\n]+)/);
  const address = addressMatch ? addressMatch[1].trim() : null;

  const dueDateMatch = text.match(/Due Date:\s*([^\n]+)/);
  const dueDate = dueDateMatch ? dueDateMatch[1].trim() : null;

//   const shadeMatch = text.match(/Shade[\s\S]+?Ceramic:.*?- ?\/([^/]+)\/ ?-/i);
//   const shade = shadeMatch ? shadeMatch[1].trim() : null;
    const shades = extractShades(text);

  console.log(text);
  console.log(shades)

  return { address, dueDate, shades };
}

function parseTxtFiles(namesPath, treatmentsPath) {
  // Read and parse names
  const namesContent = fs.readFileSync(namesPath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  const patient = namesContent[0] || null;
  const doctor = namesContent[1] || null;

  // Read and parse treatments
  const treatmentsContent = fs.readFileSync(treatmentsPath, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
  // each line like: "18,Crown Full Contour Ceramic"
  const teeth = treatmentsContent.map(line => {
    const [tooth, treatment] = line.split(',');
    return { tooth: tooth.trim(), treatment: treatment.trim() };
  });

  return { patient, doctor, teeth };
}

(async () => {
  const pdfData = await parsePDF(filePath);
  const txtData = parseTxtFiles(namesFile, treatmentsFile);

  // Combine
  const combined = { 
    patient: txtData.patient,
    doctor: txtData.doctor,
    teeth: txtData.teeth,
    address: pdfData.address,
    dueDate: pdfData.dueDate,
    shades: pdfData.shades
  };

  console.log(combined);
})();

module.exports = {
  getCombinedWinvoiceData: async function () {
    const downloadsDir = path.join(require('os').homedir(), 'Downloads');
    const filePath = getMostRecentPDFInRecentFolders(downloadsDir, 1);
    
    if (!filePath) {
      throw new Error('No recent PDF found');
    }
    
    const pdfData = await parsePDF(filePath);
    const namesFile = "C:\\Users\\User\\Desktop\\Case Automation\\patient_info.txt";
    const treatmentsFile = "C:\\Users\\User\\Desktop\\Case Automation\\treatments.txt";
    const txtData = parseTxtFiles(namesFile, treatmentsFile);

    return { 
      patient: txtData.patient,
      doctor: txtData.doctor,
      teeth: txtData.teeth,
      address: pdfData.address,
      dueDate: pdfData.dueDate,
      shades: pdfData.shades
    };
  }
};
