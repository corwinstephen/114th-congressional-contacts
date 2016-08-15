const fs = require('fs');
const d3  = require('d3-dsv');
const _ = require('lodash');
const csvWriter = require('csv-write-stream');


// Download the Node helper library from twilio.com/docs/node/install
// accountSid and authToken from twilio.com/user/account
// https://www.twilio.com/docs/api/lookups
const LookupsClient = require('twilio').LookupsClient;
const client = new LookupsClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const csvfile = 'memberCells.csv';
const inputData = d3.csvParse(fs.readFileSync(csvfile, 'utf8'));

// now let's focus on just cell phone numbers
const enrichedData = [];

const d = inputData[0];
// convert to E.164 format https://en.wikipedia.org/wiki/E.164
const withoutDashes = d.memberCell.replace(/-/g, '');
const currentE164Number =  `+1${withoutDashes}`;
// console.log('withoutDashes', withoutDashes);
// console.log('E164Number', E164Number);

// get the carrier data from the twilio API
async function getCarrierMetadata(E164Number) {
  try {
    await client.phoneNumbers(E164Number).get({ type: 'carrier' }, function (error, number) {
      const response = {};
      if (error) { console.log('error', error) };
      console.log('carrier response from twilio API', number);
      response.carrierErrorCode = number.carrier.error_code;
      response.carrierType = number.carrier.type;
      response.carrierName = number.carrier.name;
      response.mobileNetworkCode = number.carrier.mobile_network_code;
      response.mobileCountryCode = number.carrier.mobile_country_code;
      return response;
    });
  } catch(error) {
    console.error(error);
  }
}

getCarrierMetadata(currentE164Number);
console.log('this will print first to show that I am async!')
