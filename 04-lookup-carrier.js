const fs = require('fs');
const d3 = require('d3-dsv');
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

// const d = inputData[0];

inputData.forEach(d => {
  // convert to E.164 format https://en.wikipedia.org/wiki/E.164
  const withoutDashes = d.memberCell.replace(/-/g, '');
  const E164Number = `+1${withoutDashes}`;
  // console.log('withoutDashes', withoutDashes);
  // console.log('E164Number', E164Number);

  // get the carrier data from the twilio API
  async function getCarrierMetadata() {
    try {
      const number = await client.phoneNumbers(E164Number).get({
        type: 'carrier',
      });

      const response = {};
      console.log('carrier response from twilio API', number);
      response.carrierErrorCode = number.carrier.error_code;
      response.carrierType = number.carrier.type;
      response.carrierName = number.carrier.name;
      response.mobileNetworkCode = number.carrier.mobile_network_code;
      response.mobileCountryCode = number.carrier.mobile_country_code;
      return response;
    } catch (e) {
      return e;
    }
  }

  // also get the caller name data from the twilio API
  async function getCallerMetadata() {
    try {
      const number = await client.phoneNumbers(E164Number).get({
        type: 'caller-name',
      });

      const response = {};
      console.log('caller-name response from  twilio API', number);
      response.callerNameErrorCode = number.caller_name.error_code;
      response.callerName = number.caller_name.caller_name;
      response.callerType = number.caller_name.caller_name;
      return response;
    } catch (e) {
      return e;
    }
  }

  async function program() {
    let result = _.assign({}, d);
    console.log('result', result);
    try {
      const carrierResponse = await getCarrierMetadata();
      result = _.assign(result, carrierResponse);
      console.log('carrierResponse result', result);
      const callerResponse = await getCallerMetadata();
      result = _.assign(result, callerResponse);
      console.log('callerResponse result', result);

      return result;
    } catch (e) {
      return e;
    }
  }

  // Execute program() and print the result.
  program().then((result) => {
    enrichedData.push(result);

    // if this is the last record, write the results to csv
    if (enrichedData.length === inputData.length) {
      console.log('enrichedData', enrichedData);
      const outputData = enrichedData;
      // write a csv file
      const writer = csvWriter();
      writer.pipe(fs.createWriteStream('memberCellsCarriersAPI.csv'));
      outputData.forEach(item => {
        writer.write(item);
      });
      writer.end();
    }
  });
})
