const { getIndicatorsHistory } = require('./historyFetcher');
const { generateChart } = require('./chartGenerator');
const fs = require('fs');

async function run() {
    try {
        console.log('Fetching history...');
        const history = await getIndicatorsHistory();
        console.log('History fetched. Keys:', Object.keys(history));

        console.log('Generating chart...');
        const buffer = await generateChart(history);

        fs.writeFileSync('test_chart.png', buffer);
        console.log('Chart saved to test_chart.png');
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
