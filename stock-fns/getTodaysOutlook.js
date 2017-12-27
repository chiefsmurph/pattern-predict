const { MAX_DIGITS } = require('../settings');

// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');
const arrayAvg = require('../utils/arrayAvg');

// predictFns
const addTestPerfToOutlook = require('../strategy-testing/addTestPerfToOutlook');
const executePerms = require('../predict-fns/executePerms');
const createPredictions = require('../predict-fns/createPredictions');

const fs = require('mz/fs');

const getTodaysOutlook = async stockTicker => {
  // STOCKS
  console.log('getting todays outlook for ', stockTicker);
  const csvFilePath = './stock-data/' + stockTicker + '.csv';
  const dayArray = await csvToArray(csvFilePath);
  // console.log('dayarray', dayArray);
  const upDownString = generateUpDownString(dayArray);

  // BBALL
  // const upDownString = await fs.readFile('./basketball-data/LAL.txt', 'utf8');
  // console.log('upDownString', upDownString);
  // console.log('\n');

  const permsExecuted = executePerms(upDownString, MAX_DIGITS);
  let todaysOutlook = createPredictions(upDownString, permsExecuted);

  try {
    const testResultsFile = './stock-test-results/' + stockTicker + '.json';
    var testsResults = JSON.parse(await fs.readFile(testResultsFile, 'utf8'));
  } catch (e) {
    console.error('y', e);
  }
  if (testsResults) {
    todaysOutlook = addTestPerfToOutlook(todaysOutlook, testsResults);
    console.log('found test results');
  } else {
    console.log('run ./stock-fns/testStrategiesOnStock to add strategy performance');
  }
  // console.log('todays outlook')
  // console.log(JSON.stringify(todaysOutlook, null, 2));

  return {
    stockTicker,
    todaysOutlook
  };
};

const getOutlookForMultiple = async arrStockTickers => {

  let allResults = await Promise.all(
    arrStockTickers.map(ticker => getTodaysOutlook(ticker))
  );

  allResults = allResults.filter(result => !!result).map(result => ({
    ...result,
    singleMetric: (obj => {
      const importantMetrics = [];
      Object.keys(obj.todaysOutlook.strategies).forEach(stratKey => {
        const stratVal = obj.todaysOutlook.strategies[stratKey].val || obj.todaysOutlook.strategies[stratKey];
        stratVal && importantMetrics.push(stratVal);
        console.log('here', importantMetrics);
        if (obj.todaysOutlook.strategies[stratKey].testPerformance) {
          Object.keys(obj.todaysOutlook.strategies[stratKey].testPerformance).forEach(timeBreakdown => {
            importantMetrics.push(obj.todaysOutlook.strategies[stratKey].testPerformance[timeBreakdown].percCorrect);
          });
        }
        console.log('there', importantMetrics);
      });
      console.log('imp', importantMetrics);
      return arrayAvg(importantMetrics.filter(met => !!met));
    })(result)
  }));

  allResults = allResults.sort((a, b) => b.singleMetric - a.singleMetric);

  console.log('-----------------------------');
  console.log('allresults')
  console.log(JSON.stringify(allResults, null, 2));
  console.log('-----------------------------');
  console.log('recommendations for the day');
  allResults.forEach((result, i) => {
    console.log(`${i+1}. ${result.stockTicker} - single metric: ${result.singleMetric}`);
  });

};

(async() => {
  console.log('here', process.argv[1]);
  if (process.argv[1].toLowerCase().includes('getTodaysOutlook'.toLowerCase())) {
    console.log('here');
    let tickersToProcess = process.argv.slice(2);
    if (!tickersToProcess.length) {
      tickersToProcess = require('../stocksOfInterest');
    }
    await getOutlookForMultiple(tickersToProcess);
  }
})();


module.exports = getTodaysOutlook;
