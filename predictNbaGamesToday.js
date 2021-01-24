
const { MAX_DIGITS } = require('./settings.js');

const fs = require('mz/fs')

// nba scraping
const getNbaGamesToday = require('./scraping/getNbaGamesToday');
const basketballWlScraperCheerio = require('./scraping/basketballWlScraperCheerio');
const getSportsbook = require('./scraping/basketballSportsbook');

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
      const [{
        teamName: team1Name,
        teamData: team1Data
      }, {
        teamName: team2Name,
        teamData: team2Data
      }] = await Promise.all(
        matchup.map(basketballWlScraperCheerio)
      );
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
        team1Data,
        team2Data
      ].map(rawt => {
        const thisSeason = getThisSeason(rawt);
        const upDownString = Object.keys(rawt).map(yr => rawt[yr]).join('');
        return {
          ...thisSeason,
          ...findPatternsAndReturnTodaysOutlook(upDownString, {
            maxDigits: thisSeason.length
          }),
        };
      });
      const [team1, team2] = matchup;
      const values = [
        t1.strategies.avgPerc - t2.strategies.avgPerc,
        t1.strategies.weightedPerc - t2.strategies.weightedPerc
      ];
      const winningTeam = values.every(v => v > 0) ? team1Name : team2Name;
      const confidence = Math.max(
        ...values.map(Math.abs)
      );
      return {
        teams: {
          home: {
            name: team1Name,
            shortName: team1,
            ...t1,
          },
          away: {
            name: team2Name,
            shortName: matchup,
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
    games: todaysPredictions.sort((a, b) => b.prediction.confidence - a.prediction.confidence),
  };


}, 60 * 12);  // 12 hours


const addSportsBookOdds = async prediction => {
  console.log('adding sportsbook odds...')
  const sportsbook = await getSportsbook();
  if (prediction.date !== sportsbook.date) {
    console.log(`sorry the dates didn't align`);
    return;
  }
  prediction.games.forEach(game => {
    const shortHome = game.teams.home.shortName;
    console.log({ shortHome })
    console.log(JSON.stringify({ sportsBookGames: sportsbook.games }, null, 2));
    const relatedBookGame = sportsbook.games.find(bookGame => bookGame.home.team === shortHome);
    if (!relatedBookGame) return console.log('couldnt find that game');
    console.log({ relatedBookGame });
    game.teams.home.sportsbook = relatedBookGame.home;
    delete game.teams.home.sportsbook.teamName;
    game.teams.away.sportsbook = relatedBookGame.away;
    delete game.teams.home.sportsbook.teamName;
  });
};



module.exports = async anotherDay => {
  const d = anotherDay ? new Date(anotherDay) : new Date();
  const dateStr = d.toLocaleDateString();
  console.log({
    anotherDay,
    dateStr
  });
  const prediction = await predictGames(dateStr);
  const isToday = dateStr === (new Date()).toLocaleDateString();
  console.log({ isToday });
  if (isToday) {
    await addSportsBookOdds(prediction);
  }
  return prediction;
};