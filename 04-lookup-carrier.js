const fs = require('fs');
const d3  = require('d3-dsv');
const _ = require('lodash');
const csvWriter = require('csv-write-stream');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

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
const E164Number =  `+1${withoutDashes}`;
// console.log('withoutDashes', withoutDashes);
// console.log('E164Number', E164Number);

// get the carrier data from the twilio API
const getCarrierMetadata = async (function () {
  await (function () {
    client.phoneNumbers(E164Number).get({
      type: 'carrier'
    }, function (error, number) {
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
  });
})
    
// also get the caller name data from the twilio API
const getCallerMetadata = async (function () {
  await (function () {
    client.phoneNumbers(E164Number).get({
      type: 'caller-name'
    }, function (error, number) {
      const response = {};
      if (error) { console.log('error', error) };
      console.log('caller-name response from  twilio API', number);
      response.callerNameErrorCode = number.caller_name.error_code;
      response.callerName = number.caller_name.caller_name;
      response.callerType = number.caller_name.caller_name;
      return response;
    });
  })
})

const program = async (function () {
  let result = _.assign({}, d);
  console.log('result', result);
  try  {
    const carrierResponse = await(getCarrierMetadata());
    result = _.assign(result, carrierResponse);
    console.log('carrierResponse result', result);
    const callerResponse = await(getCallerMetadata());
    result = _.assign(result, callerResponse);
    console.log('callerResponse result', result);
  } catch (ex) {
    console.log('Caught an error');
  }
  console.log('program result after try catch', result);
  return result;
})

// Execute program() and print the result.
program().then(function (result) {
  enrichedData.push(result);
  console.log('enrichedData', enrichedData);
  const outputData = enrichedData;
  // write a csv file
  const writer = csvWriter();
  writer.pipe(fs.createWriteStream('memberCellsCarriers.csv'));
  outputData.forEach(d => {
    writer.write(d);
  })
  writer.end();
});
