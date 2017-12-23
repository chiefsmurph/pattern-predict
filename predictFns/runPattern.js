
function runPattern(upDownString, pattern) {
  const myRe = new RegExp(`${pattern}.`, 'ig');
  let myArray;
  const upDownArray = [];
  while ((myArray = myRe.exec(upDownString)) !== null) {
    var msg = 'Found ' + myArray[0] + '. ';
    msg += 'Next match starts at ' + myRe.lastIndex;
    // console.log(msg);
    // console.log('went up?', myArray[0].slice(-1));
    upDownArray.push(myArray[0].slice(-1) === '1');
  }

  // console.log('\nupDownArray', upDownArray);
  const numUp = upDownArray.reduce((acc, val) => {
    return acc + (!!val ? 1 : 0);
  }, 0);
  const perc = Math.round(numUp / upDownArray.length * 10000) / 100;
  return {
    perc,
    count: upDownArray.length
  };
}


module.exports = runPattern;
