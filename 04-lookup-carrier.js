const fs = require('fs');
const d3  = require('d3-dsv');
const csvWriter = require('csv-write-stream');

// Download the Node helper library from twilio.com/docs/node/install
// These are your accountSid and authToken from twilio.com/user/account
const accountSid = 'AC8e976f8d1f386887e1c6e84809744650';
const authToken = 'your_auth_token';
const LookupsClient = require('twilio').LookupsClient;
const client = new LookupsClient(accountSid, authToken);

const csvfile = 'memberCells.csv';
const inputData = d3.csvParse(fs.readFileSync(csvfile, 'utf8'));

// now let's focus on just cell phone numbers
const enrichedData = [];
inputData.forEach(d => {

  // convert to E.164 format
  

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
})

const outputData = enrichedData;

// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream('memberCells.csv'));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();