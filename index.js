
const { MAX_DIGITS } = require('./settings.js');

const csvFilePath = './stock-data/GSPC.csv';
const fs = require('mz/fs')

// utils
const csvToArray = require('./utils/csvToArray');
const generateUpDownString = require('./utils/generateUpDownString');

// predictFns
const createPredictions = require('./predictFns/createPredictions');
const executePerms = require('./predictFns/executePerms');

const testPredictions = require('./predictFns/testPredictions');


const findPatternsAndReturnTodaysOutlook = (upDownString, options = {}) => {
  const permsExecuted = executePerms(upDownString, MAX_DIGITS);

  const forPresenting = permsExecuted
    .filter(perm => perm.count > 10)
    .sort((a, b) => b.perc - a.perc);

  if (options.showPerms) {
    console.log('permutation patterns found in desc order')
    console.log(forPresenting);
  }
  if (options.runTests) {
    testPredictions(upDownString, 300, options.executePermsEveryDay ? null : permsExecuted);
  }
  const todaysOutlook = createPredictions(upDownString, permsExecuted);
  return todaysOutlook;
};


(async () => {

  // STOCKS
  const dayArray = await csvToArray(csvFilePath);
  console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);

  // BBALL
  // const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  // console.log('upDownString', upDownString);
  // console.log('\n');

  const todaysOutlook = findPatternsAndReturnTodaysOutlook(upDownString, {
    showPerms: true,
    // runTests: true,
    // executePermsEveryDay: true
  });
  console.log('todays outlook', todaysOutlook);

})();
