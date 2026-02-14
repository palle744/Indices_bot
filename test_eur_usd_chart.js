const { getIndicatorsHistory } = require('./historyFetcher');
const { generateChart } = require('./chartGenerator');
const fs = require('fs');

async function run() {
    try {
        console.log('Fetching history...');
        const history = await getIndicatorsHistory();

        if (history.EURO_USD && history.EURO_USD.length > 0) {
            console.log(`✅ Euro/USD data found: ${history.EURO_USD.length} points`);
            console.log('Last point:', history.EURO_USD[history.EURO_USD.length - 1]);
        } else {
            console.error('❌ No Euro/USD data found!');
            // Log what we have to debug
            console.log('TC points:', history.TC ? history.TC.length : 0);
            console.log('EURO points:', history.EURO ? history.EURO.length : 0);
            return;
        }

        console.log('Generating Euro/USD chart...');
        const buffer = await generateChart(history, 'EURO_USD');
        fs.writeFileSync('test_chart_EURO_USD.png', buffer);
        console.log('Saved test_chart_EURO_USD.png');

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
