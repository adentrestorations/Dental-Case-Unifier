const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');
const os = require("os");

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


const userHomeDir = os.homedir();

const namesFile = path.join(userHomeDir, "Desktop", "Case Automation", "patient_info.txt");
const treatmentsFile = path.join(userHomeDir, "Desktop", "Case Automation", "treatments.txt");

async function parsePDF(filePath) {


function extractShades(rawText) {

    function isPossibleDate(parts) {
  if (!Array.isArray(parts) || parts.length !== 3) return false;

  const [month, day, year] = parts.map(p => parseInt(p, 10));

  // Check for valid numeric ranges
  if (
    Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year) ||
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    year < 1000 || year > 9999
  ) {
    return false;
  }

  // Extra validation for day based on month/year
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

    function subShades(sh) {
        const validShades = ['-', '0M1', '1M1', '1M2', '2L1.5', '2L2.5', '2M1', '2M2', '2M3', '2R1.5', '2R2.5', '3L1.5', '3L2.5', '3M1', '3M2', '3M3', '3R1.5', '3R2.5', '4L1.5', '4L2.5', '4M1', '4M2', '4M3', '4R1.5', '4R2.5', '5M1', '5M2', '5M3', '440', 'O40', '110', 'A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'OM2']
         for (const shade of validShades) {
    if (sh.includes(shade)) {
      return shade;
    }
  }

  // If nothing matched, keep original or fallback
  return sh;
    }
  const lines = rawText.split(/\r?\n/); // split into lines (Windows/Unix safe)

  for (const line of lines) {
    const firstSlash = line.indexOf('/');
    const secondSlash = line.indexOf('/', firstSlash + 1);

    // Check if two slashes exist and skip unwanted patterns
    if (
      firstSlash !== -1 &&
      secondSlash !== -1 &&
      !(line.includes('/Body')) &&
      !(line.includes('/Gi'))
    ) {
      // Text between slashes → shade2
      let shade2 = line.slice(firstSlash + 1, secondSlash);

      // Text after second slash until space/newline → shade3
      const afterSecond = line.slice(secondSlash + 1);
      let stopIndex = afterSecond.search(/[\s\n]/);
      if (stopIndex === -1) stopIndex = afterSecond.length;
      let shade3 = afterSecond.slice(0, stopIndex);

      // Text before first slash until space or dash → shade1
      let startIndex = firstSlash - 1;
      while (startIndex >= 0 && line[startIndex] !== ' ' && line[startIndex] !== '-') {
        startIndex--;
      }
      let shade1 = line.slice(startIndex + 1, firstSlash);

       if (shade1.trim() === '') {
        shade1 = '-';
      }

      let currentShades = [subShades(shade1), shade2, shade3]

      if (!(isPossibleDate(currentShades))) {
        return currentShades;
      }
    }
  }

  // If nothing matched
  return ['-', '-', '-'];
}







// function extractShades(rawText) {
//   const shadesArray = [];
//   const lines = rawText.split(/\r?\n/); // split by newline
  
//   for (let index = 0; index < lines.length; index++) {
//     const line = lines[index];
//     console.log(`Line ${index + 1}: ${line}`);

//     const firstSlash = line.indexOf("/");
//     if (firstSlash === -1) continue;

//     const secondSlash = line.indexOf("/", firstSlash + 1);
//     if (secondSlash === -1) continue;

//     const shade2 = line.slice(firstSlash + 1, secondSlash);

//     // Skip unwanted prefixes
//     if (shade2.startsWith("Body") || shade2.startsWith("Gi")) continue;

//     // Get shade3: rest of word after second slash until space/newline
//     const afterSecond = line.slice(secondSlash + 1);
//     let stopIndex = afterSecond.search(/\s/);
//     if (stopIndex === -1) stopIndex = afterSecond.length;
//     const shade3 = afterSecond.slice(0, stopIndex);

//     // Get shade1: text before first slash, stopping at space or dash
//     let startIndex = firstSlash - 1;
//     while (startIndex >= 0 && line[startIndex] !== " " && line[startIndex] !== "-") {
//       startIndex--;
//     }
//     const shade1 = line.slice(startIndex + 1, firstSlash);

//     shadesArray.push([shade1, shade2, shade3]);
//   }

//   return shadesArray.length ? shadesArray : ["-", "-", "-"];
// }


// function extractShades(rawText) { //this function takes a raw text and outputs the shades found.
//   const shadesArray = [];
//   const lines = rawText.split(/\r?\n/); // split by newline, handle Windows & Unix
//   lines.forEach((line, index) => {
//     console.log(`Line ${index + 1}: ${line}`);
//     for (let i = 1; i < line.length; i++) {
//       if (line.charAt(i) === `/`) {
//         if (!(line.charAt(i + 1) === `B` && line.charAt(i + 2) === `o` && line.charAt(i + 3) === `d` && line.charAt(i + 4) === `y`) && !(line.charAt(i + 1) === `G` && line.charAt(i + 2) === `i`)) {
//           const first = line.indexOf(`/`);
//           const second = line.indexOf(`/`, first);
//           if (first === -1 || second === -1) {
//             //do nothing
//           }
//           else {
//             const diff = second - first - 1;
//             let shade2 = line.slice(first + 1, second);

//             const afterSecond = text.slice(second + 1);

//             // Find first space or newline
//             let stopIndex = afterSecond.search(/[\s\n]/);
//             if (stopIndex === -1) stopIndex = afterSecond.length;

//             let shade3 = afterSecond.slice(0, stopIndex);

//             const firstSlashIndex = text.indexOf("\\");
//             if (firstSlashIndex === -1) return null;

//             // Look backwards from the slash
//             let startIndex = firstSlashIndex - 1;
//             while (startIndex >= 0 && text[startIndex] !== " " && text[startIndex] !== "-") {
//               startIndex--;
//             }

//             // Slice from the char after the space/dash up to the slash
//             let shade1 = text.slice(startIndex + 1, firstSlashIndex);

//             return [shade1, shade2, shade3];
//           }
//         }
//       }
//     }
//   });
//   return [`-`, `-`, `-`];
// }
















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
    const namesFile = path.join(userHomeDir, "Desktop", "Case Automation", "patient_info.txt");
    const treatmentsFile = path.join(userHomeDir, "Desktop", "Case Automation", "treatments.txt");
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
