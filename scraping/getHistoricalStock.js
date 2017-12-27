const puppeteer = require('puppeteer');
const fs = require('mz/fs');

const timeoutPromise = require('../utils/timeoutPromise');

const getHistoricalStock = async (stock) => {
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
    await timeoutPromise(3000);
    await page.click('section > div > div > div span span svg');
    await timeoutPromise(1000);
    await page.click('span[data-value="MAX"]');
    await timeoutPromise(1000);
    await page.click('div[data-test="date-picker-menu"] div button span');
    await timeoutPromise(1000);
    await page.click('section > div > div > button');
    await timeoutPromise(10000);
    await page.click('section > div div span a');
    await timeoutPromise(5000);


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

module.exports = executeHistoricalStock;
