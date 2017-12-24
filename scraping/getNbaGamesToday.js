const request = require('request');
const cheerio = require('cheerio');
const fs = require('mz/fs');

const getMonthName = date => {
  console.log('month name')
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return monthNames[date.getMonth()].toLowerCase();
};
const dayCommaYear = date => {
  console.log('day comma')
  return date.getDate() + ", " + date.getFullYear();
};

const scrapeTodaysGames = async () => {

    console.log('scraping todays games');
    const d = new Date();
    const currentMonth = getMonthName(d);
    const dayCommaYearStr = dayCommaYear(d);
    console.log('dayCommaYearStr', dayCommaYearStr);
    return new Promise((resolve, reject) => {
      const url = `https://www.basketball-reference.com/leagues/NBA_2018_games-${currentMonth}.html`;
      console.log('url', url);
      request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          // console.log(html);
          var $ = cheerio.load(html);
          const gamesToday = [];
          $('table#schedule tr').each(function(i, el) {
            const $this = $(this);
            console.log($this.text());
            const isGameToday = $this.find('th').text().includes(' ' + dayCommaYearStr);
            if (isGameToday) {
              gamesToday.push([
                  $this.find('td:nth-child(3) a').attr('href').split('/')[2],
                  $this.find('td:nth-child(5) a').attr('href').split('/')[2]
              ]);
            }
          });
          resolve(gamesToday);
        }
      });
    });

};

// (async() => {
//   const todaysGames = await scrapeTodaysGames();
//   console.log('todaysGames', todaysGames);
// })();

module.exports = scrapeTodaysGames;
