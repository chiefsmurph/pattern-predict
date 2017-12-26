const cluster = require('cluster');
const testStrategiesOnStock = require('../stock-fns/testStrategiesOnStock');

const childProcess = async () => {

  console.log(`Worker ${process.pid} started`);
  process.on('message', async ({ stockTicker }) => {
    if (!stockTicker) return process.exit();
    console.log('starting', stockTicker);
    await testStrategiesOnStock(stockTicker);
    console.log('done', stockTicker);
    process.send({ done: stockTicker });
  });

};


module.exports = childProcess;
