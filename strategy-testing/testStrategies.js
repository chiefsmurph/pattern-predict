const arrayAvg = require('../utils/arrayAvg');

const createPredictions = require('../predict-fns/createPredictions');
const executePerms = require('../predict-fns/executePerms');

const testStrategies = (upDownString, numDaysToTest, permsExecuted, rawData, ticker) => {

  const testResults = [];
  for (var i = 1; i <= numDaysToTest; i++) {
    // console.log('testing for today - ' + i + ' days');

    let goBackRandomDays = i;
    // goBackRandomDays = Math.round(Math.random() * goBackRandomDays);
    // let goBackRandomDays = i;
    // console.log('going back ', goBackRandomDays, ' days');
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
      }, {}),
      rawData: rawData[upDownString.length - i - 1]
    };
    // console.log(resultObj);
    testResults.push(resultObj);
    if (i % 50 === 0) {
      console.log(ticker, 'finished test ', i, ' of ', numDaysToTest);
    }
  }

  console.log('done testing', ticker)
  return testResults;


};

module.exports = testStrategies;
