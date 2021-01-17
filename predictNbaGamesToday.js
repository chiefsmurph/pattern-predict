
const { MAX_DIGITS } = require('./settings.js');

const fs = require('mz/fs')

// nba scraping
const getNbaGamesToday = require('./scraping/getNbaGamesToday');
const basketballWlScraperCheerio = require('./scraping/basketballWlScraperCheerio');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./predict-fns/deprecated - findPatternsAndReturnTodaysOutlook');

(async () => {

  const anotherDay = process.argv.slice(2).join(' ');
  console.log({ anotherDay})
  const todaysGames = await getNbaGamesToday(anotherDay);
  console.log('todaysGames', todaysGames);
  const todaysPredictions = [];
  for (let matchup of todaysGames) {
    const [rawt1, rawt2] = await Promise.all(
      matchup.map(basketballWlScraperCheerio)
    );
    console.log(
      JSON.stringify(
        {
          matchup,
          rawt1,
          rawt2,
        },
        null, 2
      )
    )
    console.log('----------------');
    console.log('now predicting...');
    const [
      t1Outlook,
      t2Outlook
    ] = [
      rawt1,
      rawt2
    ].map(rawt => {
      const upDownString = Object.keys(rawt).map(yr => rawt[yr]).join('');
      return findPatternsAndReturnTodaysOutlook(upDownString).strategies;
    });
    console.log('t1Outlook', t1Outlook);
    console.log('t2Outlook', t2Outlook);
    const winnerPrediction = t1Outlook.avgPerc > t2Outlook.avgPerc ? matchup[0] : matchup[1];
    todaysPredictions.push({
      team1: matchup[0],
      team2: matchup[1],
      winnerPrediction,
      confidence: Math.abs(t1Outlook.avgPerc - t2Outlook.avgPerc)
    });
    console.log('predicted', winnerPrediction);
    console.log('done predicting');
    console.log('----------------');
  }
  console.log(
    JSON.stringify(
      todaysPredictions,
      null,
      2
    )
  )
  todaysPredictions.forEach(pred => {
    console.log(`game ${pred.team1} vs ${pred.team2} predicted winner: ${pred.winnerPrediction} with ${pred.confidence} confidence`);
  });

})();
