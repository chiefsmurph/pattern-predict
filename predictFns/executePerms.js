const { MAX_DIGITS } = require('../settings');

const everyPermutation = require('./everyPermutation')(MAX_DIGITS);
const runPattern = require('./runPattern');

const executePerms = (upDownString) => {
  return everyPermutation.map((perm, i) => {
    const pattern = runPattern(upDownString, perm);
    // console.log('ran ', i, ' of ', everyPermutation.length);
    return {
      perm,
      ...pattern
    };
  });
};

module.exports = executePerms;
