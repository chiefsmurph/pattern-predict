const { MAX_DIGITS } = require('../settings.js');

const executePerms = require('./executePerms');
const getTodaysPerms = require('./getTodaysPerms');

const strategies = require('./strategies');

const createPredictions = (upDownString, permsExecuted, additionalData) => {

  const last2YearsUpDown = upDownString.slice(0 - 365 * 2);

  if (!permsExecuted) {
    permsExecuted = executePerms(last2YearsUpDown, MAX_DIGITS);
  }

  const getPerm = perm => {
    return permsExecuted.find(obj => obj.perm === perm);
  };

  const todaysPerms = getTodaysPerms(last2YearsUpDown, MAX_DIGITS)
    .map(perm => getPerm(perm))
    .filter(perm => perm && perm.perc && perm.count > 3);

  return {
    perms: todaysPerms,
    strategies: strategies(todaysPerms, additionalData)
  };
};

module.exports = createPredictions;
