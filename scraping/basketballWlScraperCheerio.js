const request = require('request');
const cheerio = require('cheerio');
const fs = require('mz/fs');

// https://www.basketball-reference.com/teams/GSW/2017_games.html

const scrapeSeason = async (team, year) => {
  return new Promise((resolve, reject) => {

    const safeGet = team => {
      try {
        return require(`../basketball-data/${team}.json`);
      } catch (e) {
        return {};
      }
    }

    const data = safeGet(team)[year];
    if (data && year !== (new Date()).getFullYear()) {
      console.log(`using ${team} year ${year} from cache`)
      return resolve({
        upDownString: data
      });
    }

    const url = `https://www.basketball-reference.com/teams/${team}/${year}_games.html`;
    request(url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        // console.log(html);
        var $ = cheerio.load(html);
        const upDownString = $('table#games td:nth-child(8)').toArray()
            .map(el => $(el).text())
            .filter(txt => txt)
            .map(wl => wl === 'W' ? 1 : 0)
            .join('');
        console.log({year, upDownString})
        resolve({
          upDownString,
          teamName: $('span[itemprop="name"]').last().text().trim()
        });
      } else {
        reject(error);
      }
    });
  });
};

const scrapeTeam = async team => {

    console.log('scraping ', team);

    const teamData = {};

    let teamName;
    const years = [];
    for (let yr = 2021; yr > 2001; yr--) {
      years.push(yr);
    }
    // console.log(years);
    for (let yr of years) {
      try {
        const response = await scrapeSeason(team, yr);
        teamData[yr] = response.upDownString;
        teamName = teamName || response.teamName;
      } catch (e) {
        console.error('y', e);
        break;
      }
      // console.log(totalUpDownString, 'totalUpDownString');
    }

    console.log('saving...')
    try {
      await fs.writeFile('./basketball-data/' + team + '.json', JSON.stringify(teamData));
      console.log('done');
      return {
        teamName,
        teamData,
      };
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
