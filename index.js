
const { MAX_DIGITS } = require('./settings.js');

const csvFilePath = './data/GSPC.csv';
const fs = require('mz/fs')

// utils
const csvToArray = require('./utils/csvToArray');
const generateUpDownString = require('./utils/generateUpDownString');

// predictFns
const runPattern = require('./predictFns/runPattern');
const everyPermutation = require('./predictFns/everyPermutation');
const getTodaysPerms = require('./predictFns/getTodaysPerms');
const createPredictions = require('./predictFns/createPredictions');
const executePerms = require('./predictFns/executePerms');

(async () => {

  // STOCKS
  // const dayArray = await csvToArray(csvFilePath);
  // console.log('dayarray', dayArray);
  // const upDownString = generateUpDownString(dayArray);

  // BBALL
  const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  console.log('upDownString', upDownString);
  // console.log('\n');
  const permsExecuted = executePerms(upDownString, MAX_DIGITS);

  const forPresenting = permsExecuted
    .filter(perm => perm.count > 10)
    .sort((a, b) => b.perc - a.perc);

  console.log(forPresenting);


  const testResults = [];
  for (var i = 1; i < 300; i++) {
    console.log('testing for today - ' + i + ' days');
    const prediction = createPredictions(upDownString.slice(0, 0 - i), permsExecuted);
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
  console.log('todays outlook', createPredictions(upDownString, permsExecuted));

})();
