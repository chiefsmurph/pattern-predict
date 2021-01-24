const express = require('express');
const app = express();

const PORT = 3002;

const predictNbaGames = require('./predictNbaGamesToday');
const getSportsbook = require('./scraping/basketballSportsbook');

/// FOR PREDICTING NBA GAMES
app.get('/nba/predict/:anotherDay?', async (req, res) => {
    const asJSON = req.query.json !== undefined;
    console.log({ asJSON });
    try {
        const prediction = await predictNbaGames(req.params.anotherDay);
        if (asJSON) {
            return res.json(prediction);
        }
        res.send(
            [
                '<pre>',
                JSON.stringify(
                    prediction,
                    null,
                    2
                ),
                '</pre>'
            ].join('\n')
        );
    } catch (e) {
        res.json({
            error: e.message
        });
    }
});

app.get('/nba/sportsbook', async (req, res) => {
    const asJSON = req.query.json !== undefined;
    console.log({ asJSON });
    try {
        const sportsbook = await getSportsbook();
        if (asJSON) {
            return res.json(sportsbook);
        }
        res.send(
            [
                '<pre>',
                JSON.stringify(
                    sportsbook,
                    null,
                    2
                ),
                '</pre>'
            ].join('\n')
        );
    } catch (e) {
        res.json({
            error: e.message
        });
    }
});

app.listen(PORT, () => console.log(`nba predictions on port ${PORT}`));