
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env.shared') });require('dotenv').config();
const { downloadShining3DCase } = require('./services/Shining3DBot');

async function test() {
  try {
    // Replace with an actual orderId you want to test
    const caseId = '123456';
    console.log(`Testing download for caseId: ${caseId}`);

    const downloadPath = await downloadShining3DCase(caseId);
    console.log('Download folder:', downloadPath);

    console.log('✅ Test completed successfully.');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

test();