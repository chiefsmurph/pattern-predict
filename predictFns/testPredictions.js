const createPredictions = require('./createPredictions');
const executePerms = require('./executePerms');

const testPredictions = (upDownString, numDaysToTest, permsExecuted) => {

  const testResults = [];
  for (var i = 1; i <= numDaysToTest; i++) {
    console.log('testing for today - ' + i + ' days');

    // let goBackRandomDays = upDownString.length / 2;
    // goBackRandomDays = Math.round(Math.random() * goBackRandomDays);
    let goBackRandomDays = i;
    console.log('going back ', goBackRandomDays, ' days');
    const todaysUpDownString = upDownString.slice(0, 0 - goBackRandomDays);
    const todaysExecutePerms = permsExecuted || executePerms(todaysUpDownString);
    const prediction = createPredictions(todaysUpDownString, todaysExecutePerms);
    const whatActuallyHappened = upDownString.substring(upDownString.length - i, upDownString.length - i + 1);
    // console.log('prediction', prediction);
    const weightedPredictedUp = prediction.weightedPerc > 50;
    const avgPredictedUp = prediction.avgPerc > 50;
    const didGoUp = whatActuallyHappened === '1';
    // console.log('didGoUp', didGoUp);
    // console.log('avgPredictedUp', avgPredictedUp);
    // console.log('weightedPredictedUp', weightedPredictedUp);
    testResults.push({
      avgPerc: prediction.avgPerc,
      weightedPerc: prediction.weightedPerc,
      avgCorrect: (avgPredictedUp === didGoUp),
      weightedCorrect: (weightedPredictedUp === didGoUp),
      didGoUp
    });
    console.log('finished test ', i, ' of ', numDaysToTest);
  }

  const percAvgCorrectOfTestGroup = tests => Math.round(tests.filter(test => test.avgCorrect).length / tests.length * 10000) / 100;
  const percWeightedCorrectOfTestGroup = tests => Math.round(tests.filter(test => test.weightedCorrect).length / tests.length * 10000) / 100;
  const displayTestGroup = (name, tests) => {
    console.log('------------------------------');
    console.log('test results for ' + name);
    console.log(tests);
    console.log('test count: ', tests.length);
    console.log('avg perc ', percAvgCorrectOfTestGroup(tests));
    console.log('weighted perc ', percWeightedCorrectOfTestGroup(tests));
  };

  const testsPredictedUp = testResults.filter(test => test.avgPerc > 50);
  displayTestGroup('overall', testResults);
  displayTestGroup('testsPredictedUp', testsPredictedUp);

  const withoutUnsures = testResults.filter(test => test.avgPerc < 40 || test.avgPerc > 60);
  displayTestGroup('withoutUnsures (> 55% || < 45%)', withoutUnsures);
  const sureThings = testResults.filter(test => test.avgPerc > 55);
  displayTestGroup('sureThings (> 55%)', sureThings);

  console.log('------------------------------');
};

module.exports = testPredictions;
