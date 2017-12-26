const arrayAvg = require('../utils/arrayAvg');

const createPredictions = require('./createPredictions');
const executePerms = require('./executePerms');

const testStrategies = (upDownString, numDaysToTest, permsExecuted) => {

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
    const followingDay = upDownString.substring(upDownString.length - i, upDownString.length - i + 1);
    // console.log('prediction', prediction);
    const wentUpFollowingDay = followingDay === '1';
    // console.log('wentUpFollowingDay', wentUpFollowingDay);
    const resultObj = {
      wentUpFollowingDay,
      strategies: Object.keys(prediction.strategies).reduce((acc, strategyKey) => {
        const curVal = prediction.strategies[strategyKey];
        acc[strategyKey] = {
          val: curVal,
          correct: wentUpFollowingDay === (curVal > 50)
        };
        return acc;
      }, {})
    };
    // console.log(resultObj);
    testResults.push(resultObj);
    console.log('finished test ', i, ' of ', numDaysToTest);
  }

  const calcStrategyPerformance = (testResults, breakdowns) => {
    console.log('------------------------------');
    // console.log(tests);
    return Object.keys(breakdowns).map(breakdownName => {
      const percFilter = breakdowns[breakdownName];
      const strategies = Object.keys(testResults[0].strategies);
      return {
        breakdownName,
        strategyPerformance: strategies.map(strategyKey => {
          const testsThatMeetFilter = testResults.filter(test => percFilter(test.strategies[strategyKey].val));
          const percCorrect = testsThatMeetFilter.filter(test => test.strategies[strategyKey].correct).length * 10000 / (testsThatMeetFilter.length * 100);
          return {
            strategy: strategyKey,
            percCorrect,
            count: testsThatMeetFilter.length
          };
        })
      };
    });

  };

  const strategyPerformance = calcStrategyPerformance(
    testResults,
    require('./percBreakdowns')
  );

  console.log('strategyPerformance');
  console.log(JSON.stringify(strategyPerformance, null, 2));
  console.log('------------------------------');

  return strategyPerformance;
};

module.exports = testStrategies;
