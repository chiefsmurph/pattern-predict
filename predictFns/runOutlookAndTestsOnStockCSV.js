// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./findPatternsAndReturnTodaysOutlook');


const runOutlookAndTestsOnStockCSV = async csvFilePath => {
  // STOCKS
  const dayArray = await csvToArray(csvFilePath);
  console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);

  // BBALL
  // const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  console.log('upDownString', upDownString);
  console.log('\n');

  const todaysOutlook = findPatternsAndReturnTodaysOutlook(upDownString, {
    showPerms: true,
    runTests: true,
    executePermsEveryDay: true,
    numTests: 200
  });
  console.log('todays outlook', todaysOutlook);
};

(async() => {
  if (process.argv[1].includes('runOutlookAndTestsOnStockCSV')) {
    await runOutlookAndTestsOnStockCSV('./stock-data/' + process.argv[2] + '.csv');
  }
})();


module.exports = runOutlookAndTestsOnStockCSV;
