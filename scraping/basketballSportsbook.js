const puppeteer = require('puppeteer');

const getSportsbook = async () => {

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(`https://www.sportsline.com/nba/odds/`, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    console.log('loaded')
    const response = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tbody tr'))
            .map(gameRow => {
                const [homeTeam, awayTeam] = [...gameRow.querySelectorAll('td h4')].map(node => node.textContent);
                const consensusCol = gameRow.querySelector('td:nth-of-type(4)');
                const odds = [...consensusCol.querySelectorAll('.primary')].map(n => n.textContent);
                let [
                    homeML,
                    awayML,
                    homeSpread,
                    awaySpread,
                    over,
                    under
                ] = odds;
                homeML = Number(homeML.split(' ')[2]);
                awayML = Number(awayML.split(' ')[2]);
                homeSpread = Number(homeSpread.split(' ')[1]);
                awaySpread = Number(awaySpread.split(' ')[1]);
                over = Number(over.slice(1));
                under = Number(under.slice(1));
                return {
                    home: {
                        team: homeTeam,
                        spread: homeSpread,
                        moneyline: homeML
                    },
                    away: {
                        team: awayTeam,
                        spread: awaySpread,
                        moneyline: awayML
                    }
                };
            });
    });
    await page.close();
    await browser.close();
};

module.exports = getSportsbook;