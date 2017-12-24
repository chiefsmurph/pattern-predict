const { MAX_DIGITS } = require('../settings.js');

const executePerms = require('./executePerms');
const getTodaysPerms = require('./getTodaysPerms');

const strategies = require('./strategies');

const createPredictions = (upDownString, permsExecuted) => {

  if (!permsExecuted) {
    permsExecuted = executePerms(upDownString, MAX_DIGITS);
  }

  const getPerm = perm => {
    return permsExecuted.find(obj => obj.perm === perm);
  };

  const todaysPerms = getTodaysPerms(upDownString, MAX_DIGITS)
    .map(perm => getPerm(perm))
    .filter(perm => perm && perm.perc && perm.count);

  return {
    perms: todaysPerms,
    ...strategies(todaysPerms)
  };
};

module.exports = createPredictions;
