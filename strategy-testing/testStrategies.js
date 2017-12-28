const arrayAvg = require('../utils/arrayAvg');

const createPredictions = require('../predict-fns/createPredictions');
const executePerms = require('../predict-fns/executePerms');

const testStrategies = (upDownString, numDaysToTest, permsExecuted, dayArray, ticker, prevTestResults) => {

  console.log('updown')
  console.log(upDownString);
  console.log('dayarray');
  console.log(dayArray);
  console.log('prevTestResults');
  console.log(prevTestResults);

  const testResults = [];

  if (prevTestResults) {
    const lastDayTested = prevTestResults[0].rawData.Date;
    console.log('l', lastDayTested);
    const reversedDayArray = dayArray.reduce((ary, ele) => { ary.unshift(ele); return ary }, []);
    numDaysToTest = reversedDayArray.findIndex(day => day.Date === lastDayTested) - 1;
    console.log('num', numDaysToTest);
  } else {
    numDaysToTest = Math.min(numDaysToTest, upDownString.length - 1);
  }

  prevTestResults && console.log(prevTestResults.length);
  console.log('updown', upDownString.length);
  console.log('numDaysToTest', numDaysToTest);
  for (var i = 1; i <= numDaysToTest; i++) {
    console.log(dayArray.length, 'd ar len');
    console.log(i, 'i');
    const rawData = dayArray[dayArray.length - i - 1];
    console.log('testing for - ' + rawData.Date);

    let goBackRandomDays = i;
    // goBackRandomDays = Math.round(Math.random() * goBackRandomDays);
    // let goBackRandomDays = i;
    console.log('going back ', goBackRandomDays, ' days');
    const todaysUpDownString = upDownString.slice(0, 0 - goBackRandomDays);
    const todaysExecutedPerms = permsExecuted || executePerms(todaysUpDownString);
    const prediction = createPredictions(todaysUpDownString, todaysExecutedPerms, {
      dayArray,
      index: upDownString.length - i - 1
    });
    const followingDay = upDownString.substring(upDownString.length - i, upDownString.length - i + 1);
    // console.log('prediction', prediction);
    const wentUpFollowingDay = followingDay === '1';
    // console.log('wentUpFollowingDay', wentUpFollowingDay);
    const resultObj = {
      wentUpFollowingDay,
      strategies: prediction.strategies,
      rawData
    };
    // console.log(resultObj);
    testResults.push(resultObj);
    if (i % 50 === 0) {
      console.log(ticker, 'finished test ', i, ' of ', numDaysToTest);
    }
  }

  console.log('done testing', ticker)
  return testResults.concat(prevTestResults || []);


};

module.exports = testStrategies;
