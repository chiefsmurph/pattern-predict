const { MAX_DIGITS } = require('../settings.js');

const executePerms = require('./executePerms');
const getTodaysPerms = require('./getTodaysPerms');

const createPredictions = (upDownString, permsExecuted) => {

  if (!permsExecuted) {
    permsExecuted = executePerms(upDownString, MAX_DIGITS);
  }

  const getPerm = perm => {
    return permsExecuted.find(obj => obj.perm === perm);
  };

  const todaysPerms = getTodaysPerms(upDownString, MAX_DIGITS)
    .map(perm => getPerm(perm))
    .filter(perm => perm && perm.perc);
  // console.log('todaysperms', todaysPerms);
  const avgPerc = (todaysPerms
    .filter(perm => perm.count)
    .reduce((acc, perm) => acc + perm.perc, 0)) / todaysPerms.length;
  const weightedPerc = (() => {
    let percentages = [];
    todaysPerms.forEach((perm, i) => {
      // console.log('perm', perm);
      percentages = percentages.concat(new Array(i).fill(perm.perc));
    });
    // console.log(percentages,' percs');
    return percentages.reduce((acc, perc) => acc + perc, 0) / percentages.length;
  })();
  // console.log('avg up today', avgPerc);
  return {
    perms: todaysPerms,
    avgPerc,
    weightedPerc
  };
};

module.exports = createPredictions;
