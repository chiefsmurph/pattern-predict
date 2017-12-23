
const digits = 14;


const csvFilePath = './data/GSPC.csv';
const csv = require('csvtojson');
const fs = require('mz/fs')

function csvToArray(file) {
  return new Promise((resolve, reject) => {
    const returnArr = [];
    csv()
      .fromFile(file)
      .on('json', jsonObj => {
        // console.log('json', jsonObj);
        returnArr.push(jsonObj);
      })
      .on('done', error => {
      	// console.log('end');
        resolve(returnArr);
      });
  });
}

function generateUpDownString(dayArray) {
  // needs Date Open Close properties
  const withUpDown = dayArray.map(day => ({
    ...day,
    Date: new Date(day.Date),
    DateInformal: day.Date,
    UpDown: (Number(day.Close) > Number(day.Open)) ? 'up' : 'down'
  }));
  // console.log('withUpDown', withUpDown);
  const upDownString = withUpDown.map(day => {
    return day.UpDown === 'up' ? 1 : 0;
  }).join('');
  return upDownString;
}


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

function getTodaysPerms(upDownString, maxDigits) {
  const returnArr = [];
  for (let i = 1; i < maxDigits + 1; i++) {
    returnArr.push(upDownString.slice(0 - i));
  }
  return returnArr;
}

(async () => {

  // STOCKS
  // const dayArray = await csvToArray(csvFilePath);
  // console.log('dayarray', dayArray);
  // const upDownString = generateUpDownString(dayArray);

  // BBALL
  const upDownString = await fs.readFile('./basketball-data/GSW.txt', 'utf8');
  console.log('upDownString', upDownString);
  // console.log('\n');

  const perms = everyPermutation(digits);
  console.log(perms);


  console.log('upDownString', upDownString);
  const permsExecuted = perms.map((perm, i) => {
    const pattern = runPattern(upDownString, perm);
    // console.log('ran ', i, ' of ', perms.length);
    return {
      perm,
      ...pattern
    };
  });

  const forPresenting = permsExecuted
    .filter(perm => perm.count > 10)
    .sort((a, b) => b.perc - a.perc);

  console.log(forPresenting);


  const createPredictions = (upDownString) => {

    const getPerm = perm => {
      return permsExecuted.find(obj => obj.perm === perm);
    };

    const todaysPerms = getTodaysPerms(upDownString, digits)
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

  const testResults = [];
  for (var i = 1; i < 300; i++) {
    console.log('testing for today - ' + i + ' days');
    const prediction = createPredictions(upDownString.slice(0, 0 - i));
    const whatActuallyHappened = upDownString.substring(upDownString.length - i, upDownString.length - i + 1);
    console.log('whatActuallyHappened', whatActuallyHappened);
    const weightedPredictedUp = prediction.weightedPerc > 50;
    const avgPredictedUp = prediction.avgPerc > 50;
    const didGoUp = whatActuallyHappened === '1';
    console.log('didGoUp', didGoUp);
    console.log('avgPredictedUp', avgPredictedUp);
    console.log('weightedPredictedUp', weightedPredictedUp);
    testResults.push({
      avgPerc: prediction.avgPerc,
      weightedPerc: prediction.weightedPerc,
      avgCorrect: (avgPredictedUp === didGoUp),
      weightedCorrect: (weightedPredictedUp === didGoUp),
      didGoUp
    });
    console.log('finished test ', i, ' of ', 100);
  }


  console.log(testResults, 'testResults');
  const percAvgCorrectOfTestGroup = tests => Math.round(tests.filter(test => test.avgCorrect).length / tests.length * 10000) / 100;
  const percWeightedCorrectOfTestGroup = tests => Math.round(tests.filter(test => test.weightedCorrect).length / tests.length * 10000) / 100;
  const displayTestGroup = (name, tests) => {
    console.log('test results for ' + name);
    console.log('test count: ', tests.length);
    console.log('avg perc ', percAvgCorrectOfTestGroup(tests));
    console.log('weighted perc ', percWeightedCorrectOfTestGroup(tests));
  };

  const testsPredictedUp = testResults.filter(test => test.avgPerc > 50);
  displayTestGroup('testResults', testResults);
  displayTestGroup('testsPredictedUp', testsPredictedUp);

  const withoutUnsures = testResults.filter(test => test.avgPerc < 40 || test.avgPerc > 60);
  displayTestGroup('withoutUnsures (> 55% || < 45%)', withoutUnsures);
  const sureThings = testResults.filter(test => test.avgPerc > 55);
  displayTestGroup('sureThings (> 55%)', sureThings);
  console.log('todays outlook', createPredictions(upDownString));
})();
