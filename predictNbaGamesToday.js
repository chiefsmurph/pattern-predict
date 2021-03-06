
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
          away: {
            name: team1Name,
            shortName: team1,
            ...t1,
          },
          home: {
            name: team2Name,
            shortName: team2,
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
  // if (prediction.date !== sportsbook.date) {
  //   console.log(`sorry the dates didn't align`);
  //   return;
  // }
  prediction.games.forEach(game => {
    const {
      away: {
        name: awayName,
        shortName: shortAway
      },
      home: {
        name: homeName,
        shortName: shortHome
      }
    } = game.teams;
    // console.log({ shortAway, shortHome })
    // console.log(JSON.stringify({ sportsBookGames: sportsbook.games }, null, 2));
    const translations = {
      BKN: 'BRK'
    };
    const isMatch = (bookTeam, predTeam) => {
      // console.log((`comparing ${team1} vs ${team2}`));
      // console.log(`shortened`, team1.slice(0, 2), team2.slice(0, 2))
      bookTeam = translations[bookTeam] || bookTeam;
      return bookTeam.slice(0, 2) === predTeam.slice(0, 2);
    };
    const relatedBookGame = sportsbook.games.find(bookGame => isMatch(bookGame.away.team, shortAway) && isMatch(bookGame.home.team, shortHome));
    if (!relatedBookGame) return console.log(`couldnt find the game: ${shortAway} @ ${shortHome}`);
    console.log(`found ${shortAway} @ ${shortHome}`);
    console.log({ relatedBookGame });
    const { team: awayTeam, ...awaySportsBook } = relatedBookGame.away;
    game.teams.away.sportsbook = awaySportsBook;
    const { team: homeTeam, ...homeSportsBook } = relatedBookGame.home;
    game.teams.home.sportsbook = homeSportsBook;

    // calc isUpset
    const { sportsbook: winningSportsbook = {} } = Object.values(game.teams)
      .find(team => team.name === game.prediction.winningTeam) || {};
    const { moneyline: winningMoneyline } = winningSportsbook;
    const isUpset = Boolean(winningMoneyline > 0);
    game.prediction.isUpset = isUpset;
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
  const isTodayOrTomorrow = d.getTime() < Date.now() + 1000 * 60 * 60 * 24 * 2;
  console.log({ isTodayOrTomorrow });
  if (isTodayOrTomorrow) {
    await addSportsBookOdds(prediction);
  }
  return prediction;
};