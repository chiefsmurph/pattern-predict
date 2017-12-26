// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');

// predictFns
const testStrategies = require('../strategy-testing/testStrategies');

const fs = require('mz/fs');

const testStrategiesOnStock = async stockTicker => {

  const csvFilePath = './stock-data/' + stockTicker + '.csv';
  const outputFile = './stock-stratperfs/' + stockTicker + '.json';

  // STOCKS
  const dayArray = await csvToArray(csvFilePath);
  console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);
  console.log('upDownString', upDownString);
  console.log('\n');

  const strategyPerformance = testStrategies(upDownString, 365);
  console.log('strategyPerformance');
  console.log(JSON.stringify(strategyPerformance, null, 2));

  await fs.writeFile(outputFile, JSON.stringify(strategyPerformance, null, 2));
  return strategyPerformance;

};

(async() => {
  if (process.argv[1].toLowerCase().includes('testStrategiesOnStock'.toLowerCase())) {
    await testStrategiesOnStock(process.argv[2]);
  }
})();


module.exports = testStrategiesOnStock;
