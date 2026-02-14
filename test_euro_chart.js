const { getIndicatorsHistory } = require('./historyFetcher');
const { generateChart } = require('./chartGenerator');
const fs = require('fs');

async function run() {
    try {
        console.log('Fetching history...');
        const history = await getIndicatorsHistory();

        if (history.EURO && history.EURO.length > 0) {
            console.log(`✅ Euro data found: ${history.EURO.length} points`);
            console.log('Last point:', history.EURO[history.EURO.length - 1]);
        } else {
            console.error('❌ No Euro data found!');
            return;
        }

        console.log('Generating Euro chart...');
        const buffer = await generateChart(history, 'EURO');
        fs.writeFileSync('test_chart_EURO.png', buffer);
        console.log('Saved test_chart_EURO.png');

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
