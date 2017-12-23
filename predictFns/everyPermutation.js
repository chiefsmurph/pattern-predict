function everyPermutation(maxDigits) {
  const options = ['0', '1'];
  const returnArr = [];
  const recurse = (base) => {
    returnArr.push(base + options[0]);
    returnArr.push(base + options[1]);
    if (base.length + 1 < maxDigits) {
      recurse(base + options[0]);
      recurse(base + options[1]);
    }
  }
  recurse('');
  return returnArr.filter(perm => perm.length >= 3);
}

module.exports = everyPermutation;
