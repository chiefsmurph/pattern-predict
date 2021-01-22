
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
      const getThisSeason = raw => {
        const chars = raw[Object.keys(raw).pop()].split('');
        const wins = chars.filter(c => c === '1').length;
        const losses = chars.filter(c => c === '0').length;
        return {
          thisSeason: chars.join(''),
          record: [wins, losses].join('-')
        };
      };
      const [
        t1,
        t2
      ] = [
        rawt1,
        rawt2
      ].map(rawt => {
        const thisSeason = getThisSeason(rawt);
        const upDownString = Object.keys(rawt).map(yr => rawt[yr]).join('');
        return {
          ...findPatternsAndReturnTodaysOutlook(upDownString, {
            maxDigits: thisSeason.length
          }),
          ...thisSeason
        };
      });
      const [team1, team2] = matchup;
      const values = [
        t1.strategies.avgPerc - t2.strategies.avgPerc,
        t1.strategies.weightedPerc - t2.strategies.weightedPerc
      ];
      const winningTeam = values.every(v => v > 0) ? team1 : team2;
      const confidence = Math.max(
        ...values.map(Math.abs)
      );
      return {
        teams: {
          away: {
            name: team1,
            ...t1,
          },
          home: {
            name: team2,
            ...t2,
          },
        },
        prediction: {
          winningTeam,
          confidence,
        }
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

  // const predictionStrings = todaysPredictions.map(pred =>
  //   `${pred.team1} (${pred.t1.record}) @ ${pred.team2} (${pred.t2.record}) predicted winner: ${pred.winnerPrediction} with ${Math.round(pred.confidence)} confidence`
  // );

  return {
    date: dateStr,
    games: todaysPredictions,
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