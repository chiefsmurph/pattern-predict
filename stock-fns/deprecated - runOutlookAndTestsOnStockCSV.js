// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('../predict-fns/findPatternsAndReturnTodaysOutlook');

// strategy-testing
const calcStrategyPerformance = require('../strategy-testing/calcStrategyPerformance');
const addTestPerfToOutlook = require('../strategy-testing/addTestPerfToOutlook');

const runOutlookAndTestsOnStockCSV = async csvFilePath => {
  // STOCKS
  const dayArray = await csvToArray(csvFilePath);
  console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);

  // BBALL
  // const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  console.log('upDownString', upDownString);
  console.log('\n');

  let [todaysOutlook, testResults] = findPatternsAndReturnTodaysOutlook(upDownString, {
    showPerms: true,
    runTests: true,
    executePermsEveryDay: true,
    numTests: 4
  });

  if (testResults) {
    todaysOutlook = addTestPerfToOutlook(todaysOutlook, testsResults);
  }
  console.log('todays outlook', todaysOutlook);

};

(async() => {
  if (process.argv[1].includes('runOutlookAndTestsOnStockCSV')) {
    await runOutlookAndTestsOnStockCSV('./stock-data/' + process.argv[2] + '.csv');
  }
})();


module.exports = runOutlookAndTestsOnStockCSV;
