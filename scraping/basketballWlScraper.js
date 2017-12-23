const puppeteer = require('puppeteer');
const fs = require('mz/fs');

// https://www.basketball-reference.com/teams/GSW/2017_games.html

const scrapeTeam = async(team) => {
    const browser = await puppeteer.launch({headless: false});

    const scrapeSeason = async (year) => {
      const page = await browser.newPage();
      console.log('page');
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
      await page.goto(`https://www.basketball-reference.com/teams/${team}/${year}_games.html`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('done');
      const upDownString = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('table#games td:nth-child(8)'))
            .map(el => el.textContent)
            .filter(txt => txt)
            .map(wl => wl === 'W' ? 1 : 0)
            .join('');
      });
      console.log('upDownArray for yr', year, ':', upDownString);
      await page.close();
      return upDownString;
    };

    const years = [];
    for (let yr = 2018; yr > 2017 - 20; yr--) {
      years.push(yr);
    }
    console.log(years);

    let totalUpDownString = '';
    for (let yr of years) {
      try {
        totalUpDownString = await scrapeSeason(yr) + totalUpDownString;
      } catch (e) {
        console.error('y', e);
      }
      console.log(totalUpDownString, 'totalUpDownString');
    }

    console.log('saving...')
    try {
      await fs.writeFile('./basketball-data/' + team + '.txt', totalUpDownString);
      console.log('done');
    } catch (e) {
      console.error(e);
    }
    await browser.close();
};

(async() => {
  await scrapeTeam('TOR');
})();

module.exports = scrapeTeam;
