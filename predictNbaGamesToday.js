
const { MAX_DIGITS } = require('./settings.js');

const fs = require('mz/fs')

// nba scraping
const getNbaGamesToday = require('./scraping/getNbaGamesToday');
const basketballWlScraperCheerio = require('./scraping/basketballWlScraperCheerio');

// predictFns
const findPatternsAndReturnTodaysOutlook = require('./predict-fns/deprecated - findPatternsAndReturnTodaysOutlook');

const cacheThis = require('./utils/cache-this');


const predictGames = cacheThis(async dateStr => {
  console.log(`predicting for ${dateStr}...`);
  const gamesToday = await getNbaGamesToday(dateStr);
  console.log({ dateStr });
  console.log('gamesToday', gamesToday);
  const todaysPredictions = await Promise.all(
    gamesToday.map(async matchup => {
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
      const getRecord = raw => {
        const chars = raw[Object.keys(raw).pop()].split('');
        const wins = chars.filter(c => c === '1').length;
        const losses = chars.filter(c => c === '0').length;
        return [wins, losses].join('-');
      };
      const [
        {
          outlook: t1Outlook,
          record: t1Record
        },
        {
          outlook: t2Outlook,
          record: t2Record
        }
      ] = [
        rawt1,
        rawt2
      ].map(rawt => {
        const upDownString = Object.keys(rawt).map(yr => rawt[yr]).join('');
        return {
          outlook: findPatternsAndReturnTodaysOutlook(upDownString).strategies,
          record: getRecord(rawt)
        };
      });
      console.log('t1Outlook', t1Outlook);
      console.log('t2Outlook', t2Outlook);
      const winnerPrediction = t1Outlook.avgPerc > t2Outlook.avgPerc ? matchup[0] : matchup[1];
      return {
        team1: matchup[0],
        t1Record,
        team2: matchup[1],
        t2Record,
        winnerPrediction,
        confidence: Math.abs(t1Outlook.avgPerc - t2Outlook.avgPerc)
      };
    })
  );
  console.log(
    JSON.stringify(
      todaysPredictions,
      null,
      2
    )
  )

  const predictionStrings = todaysPredictions.map(pred =>
    `${pred.team1} vs ${pred.team2} predicted winner: ${pred.winnerPrediction} with ${Math.round(pred.confidence)} confidence`
  );

  return {
    date: dateStr,
    predictions: predictionStrings
  };


}, 60 * 12);  // 12 hours




module.exports = async anotherDay => {
  const d = anotherDay ? new Date(anotherDay) : new Date();
  const dateStr = d.toLocaleDateString();
  console.log({
    anotherDay,
    dateStr
  })
  return predictGames(dateStr);
};