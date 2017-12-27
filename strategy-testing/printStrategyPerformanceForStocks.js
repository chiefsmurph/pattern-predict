const { single } = require('./calcStrategyPerformance');
const percBreakdowns = require('./percBreakdowns');

const fs = require('mz/fs');

const twoDecimals = require('../utils/twoDecimals');

const getStratPerfMultiple = async tickers => {

  const results = [];
  for (let ticker of tickers) {
    try {
      const testResultsFile = './stock-test-results/' + ticker + '.json';
      var testResults = JSON.parse(await fs.readFile(testResultsFile, 'utf8'));
      const percWentUp = twoDecimals(testResults.filter(test => test.wentUpFollowingDay).length / testResults.length * 100);
      results.push({
        [ticker]: {
          percWentUp,
          ...single(testResults, perc => perc > 55)
        }
      });
    } catch (e) {
      console.error('y', e);
    }
  }
  console.log(JSON.stringify(results, null, 2));

};

(async () => {
  console.log('here', process.argv[1]);
  if (process.argv[1].toLowerCase().includes('printstrategyperformance'.toLowerCase())) {

    let tickers = process.argv.slice(2);

    if (!tickers.length) {
      tickers = require('../stocksOfInterest');
    }

    console.log(tickers);
    await getStratPerfMultiple(tickers);
  }
})();
