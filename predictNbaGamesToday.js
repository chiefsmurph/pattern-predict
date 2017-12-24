
const { MAX_DIGITS } = require('./settings.js');

const csvFilePath = './stock-data/GSPC.csv';
const fs = require('mz/fs')

// utils
const csvToArray = require('./utils/csvToArray');
const generateUpDownString = require('./utils/generateUpDownString');

// nba scraping
const getNbaGamesToday = require('./scraping/getNbaGamesToday');
const basketballWlScraperCheerio = require('./scraping/basketballWlScraperCheerio');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./predictFns/findPatternsAndReturnTodaysOutlook');
const createPredictions = require('./predictFns/createPredictions');
const executePerms = require('./predictFns/executePerms');

const testPredictions = require('./predictFns/testPredictions');



(async () => {

  const todaysGames = await getNbaGamesToday();
  const todaysPredictions = [];
  for (let matchup of todaysGames) {
    console.log('scraping team ', matchup[0]);
    await basketballWlScraperCheerio(matchup[0]);
    console.log('scraping team ', matchup[1]);
    await basketballWlScraperCheerio(matchup[1]);
    console.log('----------------');
    console.log('now predicting...');
    const t1UpDownString = await fs.readFile(`./basketball-data/${matchup[0]}.txt`, 'utf8');
    const t1Outlook = findPatternsAndReturnTodaysOutlook(t1UpDownString);
    const t2UpDownString = await fs.readFile(`./basketball-data/${matchup[1]}.txt`, 'utf8');
    const t2Outlook = findPatternsAndReturnTodaysOutlook(t2UpDownString);
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
