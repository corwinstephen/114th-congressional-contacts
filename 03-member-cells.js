const fs = require('fs');
const d3  = require('d3-dsv');
const csvWriter = require('csv-write-stream');

// before this step
// `interestingColumns.csv` was edited manually
// and saved as `memberNumbers.csv`
//
// multiple values in a cell were manually split into columns
// members with no member phone number were manually removed

// let's read in `memberNumbers.csv` for some more processing
const csvfile = 'memberNumbers.csv';
const inputData = d3.csvParse(fs.readFileSync(csvfile, 'utf8'));

// now let's focus on just cell phone numbers
const subset = [];
inputData.forEach(d => {
  subset.push({
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

const outputData = subset;

// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream('memberCells.csv'));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();