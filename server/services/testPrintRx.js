// testPrintRx.js
const { printRx } = require('./MeditBot.js');

// Replace this with a real pending orderId from Medit
const testOrderId = '20863883';

(async () => {
  try {
    console.log(`Starting printRx test for orderId: ${testOrderId}`);
    await printRx(testOrderId);
    console.log('✅ printRx test completed');
  } catch (err) {
    console.error('❌ printRx test failed:', err);
  }
})();
