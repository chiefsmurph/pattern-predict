const { MAX_DIGITS } = require('../settings');

const executePerms = require('./executePerms');
const testStrategies = require('./testStrategies');
const createPredictions = require('./createPredictions');

const findPatternsAndReturnTodaysOutlook = (upDownString, options = {}) => {
  const permsExecuted = executePerms(upDownString, MAX_DIGITS);

  if (options.showPerms) {
    const forPresenting = permsExecuted
      .filter(perm => perm.count > 10)
      .sort((a, b) => b.perc - a.perc);
    console.log('permutation patterns found in desc order');
    console.log(forPresenting);
  }
  if (options.runTests) {
    var strategyPerformance = testStrategies(upDownString, options.numTests || 30, options.executePermsEveryDay ? null : permsExecuted);
  }
  const todaysOutlook = createPredictions(upDownString, permsExecuted);
  return [todaysOutlook, strategyPerformance];
};

module.exports = findPatternsAndReturnTodaysOutlook;
