const puppeteer = require('puppeteer');
const fs = require('mz/fs');
const request = require('request');
const cheerio = require('cheerio');

const timeoutPromise = require('../utils/timeoutPromise');
const csvToArray = require('../utils/csvToArray');
const arrayToCsv = require('../utils/arrayToCsv');

const hoursOfDataUpdate = 14;

const getLastScrapes = async () => {
  try {
    var lastScrapes = JSON.parse(await fs.readFile('./stock-data/lastScrapes.json', 'utf8'));
  } catch (e) {
    var lastScrapes = {};
  }
  return lastScrapes;
};

const updateLastScrapes = async (lastScrapes, stock) => {
  lastScrapes[stock] = new Date().toString();
  try {
    await fs.writeFile('./stock-data/lastScrapes.json', JSON.stringify(lastScrapes, null, 2));
  } catch (e) {
    console.error('error saving last scrapes');
  }
};

const needsUpdating = (lastScrapes, stock) => {
  if (!lastScrapes[stock]) return true;

  const currentDate = new Date();
  const dateLastScraped = new Date(lastScrapes[stock]);

  let dateOfLastDataUpdate = new Date();
  dateOfLastDataUpdate.setHours(hoursOfDataUpdate);
  if (dateOfLastDataUpdate > currentDate) {
    dateOfLastDataUpdate.setDate(dateOfLastDataUpdate.getDate() - 1);
  }

  return dateOfLastDataUpdate > dateLastScraped;
};

const scrapeNewData = async (stock, currentDayArray) => {
  console.log('starting to get new data for ', stock);
  // console.log('currentDayArray');
  // console.log(currentDayArray);
  let lastDayScraped = currentDayArray[currentDayArray.length - 1].Date;
  // console.log('lastDayScraped', lastDayScraped);

  const dateToCsvFormat = dateStr => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dateSplit = dateStr.split(/,? /);
    const monthAbbr = dateSplit[0];
    const monthNum = monthNames.findIndex(month => month.substring(0, 3) === monthAbbr);
    return `${dateSplit[2]}-${monthNum + 1}-${dateSplit[1]}`;
  };

  return new Promise((resolve, reject) => {
    request(`https://finance.yahoo.com/quote/${stock}/history`, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        // console.log(html);
        const $ = cheerio.load(html);
        const newData = [];
        $('table[data-test="historical-prices"] tbody tr').each((i, el) => {

          const tdVals = $(el).find('td').toArray()
            .map(td => $(td).text())
            .map((tdVal, i) => {
              if (i === 0) {
                return dateToCsvFormat(tdVal);
              } else if (i === 6) {
                return tdVal.split(',').join('');
              } else {
                return tdVal;
              }
            });

          console.log({ tdVal: tdVals[0] });
          if (tdVals[0] === lastDayScraped) {
            console.log('found it', i);
            return false;
          }
          if (i > 50) return reject('too many');

          const dayArrayObj = {
            'Date': tdVals[0],
            'Open': tdVals[1],
            'High': tdVals[2],
            'Low': tdVals[3],
            'Close': tdVals[4],
            'Adj Close': tdVals[5],
            'Volume': tdVals[6]
          };
          console.log('pushing', dayArrayObj);
          newData.push(dayArrayObj);

        });
        resolve(currentDayArray.concat(newData.reverse()));
      } else {
        reject(error);
      }
    });
  });
};

const getHistoricalStock = async stock => {

    console.log('starting to scrape historical content for ', stock);
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // configure puppeteer
    await page.setRequestInterception(true);
    page.on('request', request => {
      try {
        if (request.resourceType === 'image')
          request.abort();
        else
          request.continue();
      } catch (e) {
        console.error('w', e);
      }
    });
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './stock-data'})

    // do it
    await page.goto(`https://finance.yahoo.com/quote/${stock}/history`, {
      waitUntil: 'domcontentloaded',
      // timeout: 60000
    });
    console.log(stock, ': loaded page');
    await timeoutPromise(2000);
    await page.click('section > div > div > div > div > div span');  // time period dropdown
    await timeoutPromise(100);
    await page.click('button[data-value="MAX"]');   // max timeperiod
    await timeoutPromise(100);
    await page.click('section > div > div > button'); // apply
    await timeoutPromise(5000);
    await page.click('section > div div span a'); // download
    await timeoutPromise(1000);


    // const href = await page.evaluate(() => document.querySelector('section > div div span a').href);
    // console.log(href);
    //
    // const downloadedContent = await page.evaluate(async downloadUrl => {
    //   const fetchResp = await fetch(downloadUrl, {credentials: 'include'});
    //   return await fetchResp.text();
    // }, href);

    // console.log(downloadedContent)

    await page.close();
    await browser.close();

    console.log('done scraping historical content for ', stock);
};

const writeDataToFile = async (csvFilePath, data) => {
  return await fs.writeFile(csvFilePath, data);
};

const scrapeStock = async (stock) => {

  const lastScrapes = await getLastScrapes();
  if (!needsUpdating(lastScrapes, stock)) {
    return console.log('doesnt need updating', stock);
  }

  try {
    var currentDayArray = await csvToArray(`./stock-data/${stock}.csv`);
  } catch (e) {}

  if (currentDayArray && currentDayArray.length) {
    try {
      const newDayArray = await scrapeNewData(stock, currentDayArray);
      // console.log('newDayArray', newDayArray.reverse());
      const text = arrayToCsv(newDayArray);
      // console.log('text', text);
      await writeDataToFile(`./stock-data/${stock}.csv`, text);
      await updateLastScrapes(lastScrapes, stock);
    } catch (e) {
      console.log('e', e);
      if (e === 'too many') {
        console.log('unable to do "quick" data update, downloading historical data for stock', stock);
        return await executeHistoricalStock(stock);
      }
    }
  } else {
    await executeHistoricalStock(stock);
    await updateLastScrapes(lastScrapes, stock);
  }


};

const executeHistoricalStock = async stock => {
  try {
    return await getHistoricalStock(stock);
  } catch (e) {
    console.error('g', e, stock);
    return await executeHistoricalStock(stock);
  }
};

// (async() => {
//   await getHistoricalStock('GM');
// })();

module.exports = scrapeStock;
