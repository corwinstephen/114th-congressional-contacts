const fs = require('fs');
const d3  = require('d3-dsv');
const csvWriter = require('csv-write-stream');

const csvfile = '114th-congressional-contacts-clean.csv';
const inputData = d3.csvParse(fs.readFileSync(csvfile, 'utf8'));

const subset = [];
inputData.forEach(d => {
  subset.push({
    memberName: d['Member Name'],
    state: d.ST,
    district: d.Dist,
    nickName: d.Nickname,
    firstName: d.First,
    lastName: d.Last,
    memberCell: d['Member Cell'],
    term: d.Term,
    primaryHomeNumber: d['Primary Home #'],
    memberOtherNumber: d['Member Other #']
  })
})

const outputData = subset;

// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream('interestingColumns.csv'));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();