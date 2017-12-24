const arrayAvg = require('../utils/arrayAvg');

const createPredictions = require('./createPredictions');
const executePerms = require('./executePerms');


const testPredictions = (upDownString, numDaysToTest, permsExecuted) => {

  const testResults = [];
  for (var i = 1; i <= numDaysToTest; i++) {
    console.log('testing for today - ' + i + ' days');

    let goBackRandomDays = 365 - i;
    // goBackRandomDays = Math.round(Math.random() * goBackRandomDays);
    // let goBackRandomDays = i;
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
    const resultObj = {
      avgPerc: prediction.avgPerc,
      weightedPerc: prediction.weightedPerc,
      avgCorrect: (avgPredictedUp === didGoUp),
      weightedCorrect: (weightedPredictedUp === didGoUp),
      didGoUp
    };
    // console.log(resultObj);
    testResults.push(resultObj);
    console.log('finished test ', i, ' of ', numDaysToTest);
  }

  const displayTestGroup = (name, tests, percFilter = () => true) => {
    console.log('------------------------------');
    console.log('test results for ' + name);
    // console.log(tests);

    const testsAvgMeetsFilter = tests.filter(test => percFilter(test.avgPerc));
    const testsWeightedPercMeetsFilter = tests.filter(test => percFilter(test.weightedPerc));

    console.log('avg count', testsAvgMeetsFilter.length);
    console.log('weighted count', testsWeightedPercMeetsFilter.length);

    const percCorrectOfAvg = testsWeightedPercMeetsFilter.filter(test => test.avgCorrect).length * 10000 / (testsWeightedPercMeetsFilter.length * 100);
    const percCorrectOfWeighted = testsWeightedPercMeetsFilter.filter(test => test.weightedCorrect).length * 10000 / (testsWeightedPercMeetsFilter.length * 100);

    console.log('avg perc ', percCorrectOfAvg);
    console.log('weighted perc ', percCorrectOfWeighted);
  };


  displayTestGroup('overall', testResults);
  displayTestGroup('testsPredictedUp', testResults, perc => perc > 50);
  displayTestGroup('withoutUnsures (> 55% || < 45%)', testResults, perc => perc < 40 || perc > 60);
  displayTestGroup('sureThings (> 55%)', testResults, perc => perc > 50);
  displayTestGroup('real sureThings (> 60%)', testResults, perc => perc > 60);
  displayTestGroup('really sureThings (> 70%)', testResults, perc => perc > 70);

  console.log('------------------------------');
};

module.exports = testPredictions;
