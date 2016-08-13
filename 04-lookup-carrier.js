const fs = require('fs');
const d3  = require('d3-dsv');
const csvWriter = require('csv-write-stream');

// Download the Node helper library from twilio.com/docs/node/install
// accountSid and authToken from twilio.com/user/account
// https://www.twilio.com/docs/api/lookups
const LookupsClient = require('twilio').LookupsClient;
const client = new LookupsClient('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

const csvfile = 'memberCells.csv';
const inputData = d3.csvParse(fs.readFileSync(csvfile, 'utf8'));

// now let's focus on just cell phone numbers
const enrichedData = [];
inputData.some(d => {

  // convert to E.164 format https://en.wikipedia.org/wiki/E.164
  const withoutDashes = d.memberCell.replace(/-/g, '');
  console.log('withoutDashes', withoutDashes);
  const E164Number =  `+1${withoutDashes}`;
  console.log('E164Number', E164Number);

  enrichedData.push({
    memberName: d.memberName,
    state: d.state,
    district: d.district,
    nickName: d.nickName,
    firstName: d.firstName,
    lastName: d.lastName,
    term: d.term,
    memberCell: d.memberCell
  })

  return true;
})

const outputData = enrichedData;

// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream('memberCellsCarriers.csv'));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();