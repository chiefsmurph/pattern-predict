// looks at the end of updownstring and creates an array of 1, 2, 3, etc -> maxDigits length

function getTodaysPerms(upDownString, maxDigits, minDigits = 1) {
  const returnArr = [];
  for (let i = minDigits; i < maxDigits + 1; i++) {
    returnArr.push(upDownString.slice(0 - i));
  }
  return returnArr;
}

module.exports = getTodaysPerms;
