const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const getHistoricalStock = require('../scraping/getHistoricalStock');

const masterProcess = async (tickers, shouldUpdate) => {

  // first check for updates
  if (shouldUpdate) {
    for (let ticker of tickers) {
      await getHistoricalStock(ticker);
    }
    console.log('done downloading historical data');
  }

  // then run tests
  const tickersLeft = tickers.splice(0);
  const tickersCompleted = [];
  const sendWorkerNextTicker = worker => {
    worker.send({ stockTicker: tickersLeft.pop() });
    worker.isRunning = true;
    console.log('remaining tickers', tickersLeft);
  };


  console.log(`Master ${process.pid} is running`);

  let workers = [];

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    console.log(`Forking process number ${i}...`);

    const worker = cluster.fork();
    workers.push(worker);

    // Listen for messages from worker
    worker.on('message', message => {
      if (message.done) {
        console.log('master received done', message.done);
        tickersCompleted.push(message.done);
        worker.isRunning = false;
        if (tickersCompleted.length === tickers.length) {
          return process.exit();
        }
        sendWorkerNextTicker(worker);
      }
      // console.log(`Master ${process.pid} recevies message '${JSON.stringify(message)}' from worker ${worker.process.pid}`);
    });

  }

  workers.forEach(worker => sendWorkerNextTicker(worker));

  return {
    addStockToQueue: (stockTicker) => {
      tickersLeft.push(stockTicker);
      const idleWorkers = workers.filter(worker => !worker.isRunning);
      if (idleWorkers.length) {
        sendWorkerNextTicker(idleWorkers[0]);
      }
    }
  };

};

module.exports = masterProcess;
