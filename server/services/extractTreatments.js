const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");

const inputPath = process.argv[2];
const outputPath = "C:/Users/User/Desktop/Case Automation/treatments.txt";

if (!inputPath) {
  console.error("Usage: node extractTreatments.js <path to PDF>");
  process.exit(1);
}

function extractToothTreatments(text) {
  const treatments = [];

  // ⛔ Cut text at the "Notes" section to avoid false matches
  const cutoffIndex = text.indexOf("Notes");
  if (cutoffIndex !== -1) {
    text = text.substring(0, cutoffIndex);
  }

  // Match patterns like 11ImplantBasedFull ContourCeramic
  const regex = /(\b[1-3]?[0-9])([A-Z][a-zA-Z /-]{2,50})/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const toothNo = match[1];
    let treatment = match[2].trim();

    // Fix squashed words: add space before capital letters
    treatment = treatment.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Remove extra punctuation and trim
    treatment = treatment.replace(/[^a-zA-Z\s]/g, "").trim();

    // Skip irrelevant lines
    const lower = treatment.toLowerCase();
    if (
      !treatment ||
      lower.includes("road") ||
      lower.includes("street") ||
      lower.includes("pond") ||
      lower.includes("ref") ||
      lower.includes("lot") ||
      lower.includes("trapelo") ||
      lower.length < 4
    ) {
      continue;
    }

    treatments.push(`${toothNo},${treatment}`);
  }
  const veneerRegex = /(\b[1-3]?[0-9])[\s\S]{0,5}?Veneer/gi;
  let veneerMatch;
    while ((veneerMatch = veneerRegex.exec(text)) !== null) {
      const tooth = veneerMatch[1];
      const veneerEntry = `${tooth},Veneer`;

      // Prevent duplicate if already added
      if (!treatments.includes(veneerEntry)) {
        treatments.push(veneerEntry);
      }
    }

  return treatments;
}

(async () => {
  try {
    const buffer = fs.readFileSync(inputPath);
    const data = await pdfParse(buffer);

    console.log("===== PDF RAW TEXT =====\n\n" + data.text + "\n=========================");

    const treatments = extractToothTreatments(data.text);

    fs.writeFileSync(outputPath, treatments.join("\n"));
    console.log("✅ Wrote treatments to:", outputPath);
  } catch (err) {
    console.error("Error processing PDF:", err);
  }
})();