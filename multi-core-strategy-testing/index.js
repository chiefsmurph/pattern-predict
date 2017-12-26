const cluster = require('cluster');
const http = require('http');

const masterProcess = require('./masterProcess');
const childProcess = require('./childProcess');

const multiCoreStratTesting = async (tickers) => {
  if (cluster.isMaster) {
    masterProcess(tickers);
  } else {
    await childProcess();
  }
};

(async() => {
  console.log(process.argv);
  if (process.argv[1].toLowerCase().includes('multi-core'.toLowerCase())) {
    await multiCoreStratTesting(process.argv.slice(2));
  }
})();

module.exports = multiCoreStratTesting;
