const XLSX = require('xlsx');
const fs = require('fs');
const d3  = require('d3-dsv');
const csvWriter = require('csv-write-stream');

const filename = 'copy-of-114th-congressional-contacts.xls';
const read_opts = {type: 'binary'};

const workbook = XLSX.readFile(filename, read_opts);
const worksheet = workbook.Sheets['114th_Congressional_Contacts'];

const csv = XLSX.utils.sheet_to_csv(worksheet);
const data = d3.csvParse(csv)

const outputData = data;

// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream('114th-congressional-contacts.csv'));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();