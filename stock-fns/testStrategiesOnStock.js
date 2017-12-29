// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');

// predictFns
const testStrategies = require('../strategy-testing/testStrategies');

const fs = require('mz/fs');

const testStrategiesOnStock = async stockTicker => {

  const csvFilePath = './stock-data/' + stockTicker + '.csv';
  const outputFile = './stock-test-results/' + stockTicker + '.json';

  // STOCKS
  const dayArray = await csvToArray(csvFilePath);
  // console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);
  // console.log('upDownString', upDownString);
  // console.log('\n');

  try {
    const testResultsFile = './stock-test-results/' + stockTicker + '.json';
    var prevTestResults = JSON.parse(await fs.readFile(testResultsFile, 'utf8'));
  } catch (e) {
    // console.error('y', e);
  }

  const testResults = testStrategies(upDownString, 365, null, dayArray, stockTicker, prevTestResults);
  // console.log('testResults');
  // console.log(JSON.stringify(testResults, null, 2));

  const saveJSON = {
    lastTested: new Date().toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    testResults
  };
  await fs.writeFile(outputFile, JSON.stringify(testResults, null, 2));

  console.log('finished', stockTicker);
  return testResults;

};

(async() => {
  if (process.argv[1].toLowerCase().includes('testStrategiesOnStock'.toLowerCase())) {
    await testStrategiesOnStock(process.argv[2]);
  }
})();


module.exports = testStrategiesOnStock;
