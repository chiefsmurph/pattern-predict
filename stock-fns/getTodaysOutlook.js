const { MAX_DIGITS } = require('../settings');

// utils
const csvToArray = require('../utils/csvToArray');
const generateUpDownString = require('../utils/generateUpDownString');
const arrayAvg = require('../utils/arrayAvg');
const twoDecimals = require('../utils/twoDecimals');

// predictFns
const addTestPerfToOutlook = require('../strategy-testing/addTestPerfToOutlook');
const executePerms = require('../predict-fns/executePerms');
const createPredictions = require('../predict-fns/createPredictions');

// scraping
const getHistoricalStock = require('../scraping/getHistoricalStock');

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
  let todaysOutlook = createPredictions(upDownString, permsExecuted, {
    dayArray,
    index: dayArray.length - 1
  });

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

  let allResults = [];
  for (let ticker of arrStockTickers) {
    allResults.push(await getTodaysOutlook(ticker));
  }

  allResults = allResults.filter(result => !!result).map(result => {

    const importantMetrics = (obj => {
      const impMetrics = [ [], [] ];
      Object.keys(obj.todaysOutlook.strategies).forEach(stratKey => {
        const stratVal = obj.todaysOutlook.strategies[stratKey].val;
        stratVal && impMetrics[0].push(stratVal);
        // console.log('here', importantMetrics);
        if (obj.todaysOutlook.strategies[stratKey].testPerformance) {
          Object.keys(obj.todaysOutlook.strategies[stratKey].testPerformance).forEach(timeBreakdown => {
            const strategyPerformance = obj.todaysOutlook.strategies[stratKey].testPerformance[timeBreakdown].percUp;
            strategyPerformance && impMetrics[1].push(strategyPerformance);
          });
        }
        // console.log('there', importantMetrics);
      });
      // console.log('imp', importantMetrics);
      console.log('impMetrics', impMetrics);
      return impMetrics;
    })(result);

    const singleMetric = arrayAvg(importantMetrics.map(arr => arrayAvg(arr)));
    const roundInnerArrays = outer => outer.map(inner => inner.map(el => Math.round(el)));

    return {
      ...result,
      importantMetrics: roundInnerArrays(importantMetrics),
      singleMetric: twoDecimals(singleMetric)
    };

  });

  console.log('-----------------------------');
  console.log('allresults b4')
  console.log(JSON.stringify(allResults, null, 2));
  console.log('-----------------------------');

  const sortBySingleMetric = results => results.sort((a, b) => Number(b.singleMetric) - Number(a.singleMetric));
  allResults = sortBySingleMetric(allResults.filter(result => {
    console.log('sorting', result.singleMetric, result.stockTicker, !!result.singleMetric, typeof result.singleMetric, !!Number(result.singleMetric));
    return !!result.singleMetric;
  }));

  console.log('-----------------------------');
  console.log('allresults after')
  console.log(JSON.stringify(allResults, null, 2));
  console.log('-----------------------------');

  const recCategories = {};
  const categoryBreakdowns = {
    'top recommendations': result => {
      return arrayAvg(result.importantMetrics[0]) > 50 &&
        arrayAvg(result.importantMetrics[1]) > 50 &&
        result.singleMetric > 53;
    },
    'somewhat recommended': result => {
      return result.singleMetric > 50;
    },
    'not recommended': () => true
  };

  allResults.forEach(result => {
    console.log('looking at', result.stockTicker);
    Object.keys(categoryBreakdowns).some(categoryKey => {
      const categoryFilterFn = categoryBreakdowns[categoryKey];
      if (categoryFilterFn(result)) {
        recCategories[categoryKey] = (recCategories[categoryKey] || []).concat([result]);
        return true;
      }
    });
  });


  // todo : save todays outlook json
  // await fs.writeFile('./stock-predictions/')

  // console.log('recommendations for the day');
  // allResults.forEach((result, i) => {
  //   console.log(`${i+1}. ${result.stockTicker} - single metric: ${result.singleMetric} - ${JSON.stringify(result.importantMetrics)}`);
  // });
  //
  // console.log('-----------------------------');
  // console.log('-----------------------------');

  Object.keys(categoryBreakdowns).forEach(categoryKey => {
    if (recCategories[categoryKey]) {
      console.log(`category: ${categoryKey}`);
      recCategories[categoryKey].forEach((result, i) => {
        console.log(`${i+1}. ${result.stockTicker} - single metric: ${result.singleMetric} - ${JSON.stringify(result.importantMetrics)}`);
      });
    }
  });

};

(async () => {
  console.log('here', process.argv[1]);
  if (process.argv[1].toLowerCase().includes('getTodaysOutlook'.toLowerCase())) {

    let tickers = process.argv.slice(2);

    const shouldUpdate = (tickers[tickers.length - 1] === '--update');
    if (shouldUpdate) {
      tickers = tickers.slice(0, -1);
    }
    if (!tickers.length) {
      tickers = require('../stocksOfInterest');
    }
    if (shouldUpdate) {
      for (let ticker of tickers) {
        await getHistoricalStock(ticker);
      }
      console.log('done downloading historical data');
    }

    console.log(tickers);
    await getOutlookForMultiple(tickers);
  }
})();


module.exports = getTodaysOutlook;
