const { MAX_DIGITS } = require('../settings');

const executePerms = require('./executePerms');
const testPredictions = require('./testPredictions');
const createPredictions = require('./createPredictions');

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
    testPredictions(upDownString, options.numTests || 30, options.executePermsEveryDay ? null : permsExecuted);
  }
  const todaysOutlook = createPredictions(upDownString, permsExecuted);
  return todaysOutlook;
};

module.exports = findPatternsAndReturnTodaysOutlook;
