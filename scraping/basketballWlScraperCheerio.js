const request = require('request');
const cheerio = require('cheerio');
const fs = require('mz/fs');

// https://www.basketball-reference.com/teams/GSW/2017_games.html

const scrapeTeam = async(team) => {

    console.log('scraping ', team);

    const scrapeSeason = async (year) => {
      return new Promise((resolve, reject) => {
        request(`https://www.basketball-reference.com/teams/${team}/${year}_games.html`, function (error, response, html) {
          if (!error && response.statusCode == 200) {
            // console.log(html);
            var $ = cheerio.load(html);
            const upDownString = $('table#games td:nth-child(8)').toArray()
                .map(el => $(el).text())
                .filter(txt => txt)
                .map(wl => wl === 'W' ? 1 : 0)
                .join('');
            console.log(upDownString, 'here')
            resolve(upDownString);
          } else {
            reject(error);
          }
        });
      });
    };

    const years = [];
    for (let yr = 2018; yr > 2017 - 20; yr--) {
      years.push(yr);
    }
    // console.log(years);

    let totalUpDownString = '';
    for (let yr of years) {
      try {
        totalUpDownString = await scrapeSeason(yr) + totalUpDownString;
      } catch (e) {
        console.error('y', e);
        break;
      }
      // console.log(totalUpDownString, 'totalUpDownString');
    }

    console.log('saving...')
    try {
      await fs.writeFile('./basketball-data/' + team + '.txt', totalUpDownString);
      console.log('done');
    } catch (e) {
      console.error(e);
    }
};

// (async() => {
//   console.log(process.argv.slice(2));
//   for (let team of process.argv.slice(2)) {
//     await scrapeTeam(team);
//   }
// })();

module.exports = scrapeTeam;
