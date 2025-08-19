const { loginToWeTransfer } = require('./services/WeTransferBot.js');

loginToWeTransfer()
  .then(results => console.log(results))
  .catch(err => console.error('❌ Error fetching WeTransfer emails:', err));
