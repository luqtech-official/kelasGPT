
const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC || '<your_public_api_key>',
  process.env.MJ_APIKEY_PRIVATE || '<your_private_api_key>'
);

module.exports = mailjet;
