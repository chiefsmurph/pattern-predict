
const { MAX_DIGITS } = require('./settings.js');

const fs = require('mz/fs')

// nba scraping
const getNbaGamesToday = require('./scraping/getNbaGamesToday');
const basketballWlScraperCheerio = require('./scraping/basketballWlScraperCheerio');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./predict-fns/findPatternsAndReturnTodaysOutlook');

(async () => {

  const anotherDay = process.argv.slice(2).join(' ');
  const todaysGames = await getNbaGamesToday(anotherDay);
  console.log('todaysGames', todaysGames);
  const todaysPredictions = [];
  for (let matchup of todaysGames) {
    console.log('scraping team ', matchup[0]);
    const rawt1 = await basketballWlScraperCheerio(matchup[0]);
    console.log('scraping team ', matchup[1]);
    const rawt2 = await basketballWlScraperCheerio(matchup[1]);
    console.log('----------------');
    console.log('now predicting...');
    const t1UpDownString = Object.keys(rawt1).map(yr => rawt1[yr]).join('');
    const t1Outlook = findPatternsAndReturnTodaysOutlook(t1UpDownString);
    console.log('t1Outlook', t1Outlook);
    const t2UpDownString = Object.keys(rawt2).map(yr => rawt2[yr]).join('');
    const t2Outlook = findPatternsAndReturnTodaysOutlook(t2UpDownString);
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

  todaysPredictions.forEach(pred => {
    console.log(`game ${pred.team1} vs ${pred.team2} predicted winner: ${pred.winnerPrediction} with ${pred.confidence} confidence`);
  });

})();
