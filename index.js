
const { MAX_DIGITS } = require('./settings.js');

const csvFilePath = './stock-data/DE-10-year.csv';
const fs = require('mz/fs')

// utils
const csvToArray = require('./utils/csvToArray');
const generateUpDownString = require('./utils/generateUpDownString');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./predictFns/findPatternsAndReturnTodaysOutlook');
const createPredictions = require('./predictFns/createPredictions');
const executePerms = require('./predictFns/executePerms');

const testPredictions = require('./predictFns/testPredictions');



(async () => {

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

})();
