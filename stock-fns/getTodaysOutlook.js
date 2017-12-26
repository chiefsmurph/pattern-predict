const { MAX_DIGITS } = require('../settings');

// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');

// predictFns
const addTestPerfToOutlook = require('../predict-fns/addTestPerfToOutlook');
const executePerms = require('../predict-fns/executePerms');
const createPredictions = require('../predict-fns/createPredictions');

const fs = require('mz/fs');

const getTodaysOutlook = async stockTicker => {
  // STOCKS
  console.log('getting todays outlook for ', stockTicker);
  const csvFilePath = './stock-data/' + stockTicker + '.csv';
  const dayArray = await csvToArray(csvFilePath);
  console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);

  // BBALL
  // const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  console.log('upDownString', upDownString);
  console.log('\n');

  const permsExecuted = executePerms(upDownString, MAX_DIGITS);
  let todaysOutlook = createPredictions(upDownString, permsExecuted);

  try {
    const stratPerfFile = './stock-stratperfs/' + stockTicker + '.json';
    var strategyPerformance = await fs.readFile(stratPerfFile, 'utf8');
    strategyPerformance = JSON.parse(strategyPerformance);
  } catch (e) {
    console.error('y', e);
  }
  if (strategyPerformance) {
    // console.log(JSON.stringify(strategyPerformance, null, 2), 'stratperf');
    todaysOutlook = addTestPerfToOutlook(todaysOutlook, strategyPerformance);
    console.log('found strategyPerformance');
  } else {
    console.log('run ./stock-fns/testStrategiesOnStock to add testPerformance');
  }
  console.log('todays outlook', todaysOutlook);

};

(async() => {
  console.log('here', process.argv[1]);
  if (process.argv[1].toLowerCase().includes('getTodaysOutlook'.toLowerCase())) {
    console.log('here');
    await getTodaysOutlook(process.argv[2]);
  }
})();


module.exports = getTodaysOutlook;
