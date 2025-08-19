const assert = require('node:assert/strict');
const extractShades = require('./extractShades.js');

function runTests() {
  const tests = [
    { input: `OPEJKFHDK KJSADALKJ KJ DEF/GHI/JKL something else`, expected: ['DEF', 'GHI', 'JKL'], desc: 'Basic case' },
    { input: `XYZ/Body/123 other text`, expected: ['-', '-', '-'], desc: 'Skip Body' },
    { input: `HELLO-WORLD/FOO/BAR\nAnother line`, expected: ['WORLD', 'FOO', 'BAR'], desc: 'Handles newlines' },
    { input: `No slashessafasfasfasfasfasfsafasfafasfs here`, expected: ['-', '-', '-'], desc: 'typical line' },
    { input: `Order:255548660Chart #:2553
Patient:Lottero, Elinor
Doctor:Dr. Brachowicz, Elizabeth
Additional Scans
Pre-Treatment ScanDenture Copy Scan
Treatment Information
Tooth
No.
TreatmentSpecificationMaterial
Shade
Incisal/Body/Gingival
25Implant BasedFull ContourCeramic: Zirconia-/A2/-
Scan Body:BoneLevel RCImplant Manufacturer:Straumann
Restoration Type:Screw Retained
Notes
Procedure: Fixed RestorativeType: --
Practice:
Belmont Family Dentistry
Ship to Address:
75 Trapelo Road, Belmont, 02478-4448
Scan Date:
08/13/2025
Due Date:
08/28/2025
Status:`, expected: ['-', 'A2', '-'], desc: 'Simple1' },
    { input: `Order:255560490Patient:Brooks, Carl
Doctor:Dr. Pukhovitskaya, Anya
Treatment Information
Tooth No.TreatmentSpecificationMaterial
Shade
Incisal/Body/Gingival
2CrownFull ContourCeramic: Zirconia-/B2/-
Notes
Procedure: Fixed RestorativeType: --
Practice:
AP Dental - South End
Ship to Address:
1180 Washington St, Boston, 02118-2154
Scan Date:
08/13/2025
Due Date:
08/25/2025
Status:
Downloaded
Scanner Model:
Element 5D
Signature:
License:
0000000
Tooth Diagram
12345678910111213141516
32313029282726252423222120191817`, expected: ['-', 'B2', '-'], desc: 'Simple2' },
{ input: `Order:255748151Patient:Lassener, Rhonda
Doctor:Dr. CHEN, TIFFANY
Treatment Information
Tooth No.TreatmentSpecificationMaterial
Shade
Incisal/Body/Gingival
5CrownFull ContourCeramic: ZirconiaC1/C1/C1
Preparation Design Buccal:Chamfer
Notes
Dr. CHEN, TIFFANY
#3 cement retained implant crown. Gold abutment in place, please fabricate crown over
existing abutment. Thank you.
Procedure: Fixed RestorativeType: --
Practice:
AP Dental - South End
Ship to Address:
1180 Washington St, Boston, 02118-2154
Scan Date:
08/14/2025
Due Date:
08/28/2025
Status:
Downloaded
Scanner Model:
Element 5D
Signature:
License:
DN10000519
Tooth Diagram
12345678910111213141516
32313029282726252423222120191817
08/14/2025 | 12:25 PM`, expected: ['C1', 'C1', 'C1'], desc: 'Simple3' },
  ];
  
  tests.forEach(({ input, expected, desc }) => {
    const result = extractShades(input);
    assert.deepEqual(result, expected, `❌ Failed: ${desc}`);
    console.log(`✅ Passed: ${desc}`);
  });
}

runTests();
