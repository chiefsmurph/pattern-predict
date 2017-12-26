const cluster = require('cluster');
const numCPUs = require('os').cpus().length;



const masterProcess = tickers => {

  const tickersLeft = tickers.splice(0);
  const tickersCompleted = [];
  const sendWorkerNextTicker = worker => {
    worker.send({ stockTicker: tickersLeft.pop() });
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
        if (tickersCompleted.length === tickers.length) {
          return process.exit();
        }
        sendWorkerNextTicker(worker);
      }
      console.log(`Master ${process.pid} recevies message '${JSON.stringify(message)}' from worker ${worker.process.pid}`);
    });

  }

  workers.forEach(worker => sendWorkerNextTicker(worker));

};

module.exports = masterProcess;
