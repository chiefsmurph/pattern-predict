const everyPermutation = require('./everyPermutation');
const runPattern = require('./runPattern');

const permsExecuted = (upDownString, MAX_DIGITS) => {
  return everyPermutation(MAX_DIGITS).map((perm, i) => {
    const pattern = runPattern(upDownString, perm);
    // console.log('ran ', i, ' of ', perms.length);
    return {
      perm,
      ...pattern
    };
  });
};


module.exports = permsExecuted;
