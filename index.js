
const { MAX_DIGITS } = require('./settings.js');

const csvFilePath = './stock-data/MSFT.csv';
const fs = require('mz/fs')

const runOutlookAndTestsOnStockCSV = require('./predictFns/runOutlookAndTestsOnStockCSV');


(async () => {

  await runOutlookAndTestsOnStockCSV(csvFilePath);

})();
