const cluster = require('cluster');
const http = require('http');

const masterProcess = require('./masterProcess');
const childProcess = require('./childProcess');

const multiCoreStratTesting = async (tickers, shouldUpdate) => {
  if (cluster.isMaster) {
    await masterProcess(tickers, shouldUpdate);
  } else {
    await childProcess();
  }
};

(async() => {
  // console.log(process.argv);
  if (process.argv[1].toLowerCase().includes('multi-core'.toLowerCase())) {

    let tickers = process.argv.slice(2);
    // console.log(process.argv, tickers);
    if (tickers[tickers.length - 1] === '--update') {
      var shouldUpdate = true;
      tickers = tickers.slice(0, -1);
    }
    if (!tickers.length) {
      tickers = require('../stocksOfInterest');
    }
    await multiCoreStratTesting(tickers, !!shouldUpdate);

  }
})();

module.exports = multiCoreStratTesting;
