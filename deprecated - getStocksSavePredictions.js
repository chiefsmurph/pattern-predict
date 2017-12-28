const getHistoricalStock = require('./scraping/getHistoricalStock');
const exec = require('child_process').exec;

(async () => {
  const stocks = process.argv.slice(2);

  for (let stock of stocks) {

    try {
      await getHistoricalStock(stock);


      var child = exec('node ./stock-fns/runOutlookAndTestsOnStockCSV ' + stock + ' > ./output/' + stock + '.txt');
      child.stdout.on('data', function(data) {
          console.log('stdout: ' + data);
      });
      child.stderr.on('data', function(data) {
          console.log('stdout: ' + data);
      });
      child.on('close', function(code) {
          console.log('closing code: ' + code);
      });
    }
    catch (e) {
      console.error('y,', e);
    }

  }




})();
