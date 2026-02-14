const { getIndicatorsHistory } = require('./historyFetcher');
const { generateChart } = require('./chartGenerator');
const fs = require('fs');

async function run() {
    try {
        console.log('Fetching history...');
        const history = await getIndicatorsHistory();

        const keys = [null, 'TC', 'TIIE', 'CETES', 'INPC', 'MEZCLA'];

        for (const key of keys) {
            console.log(`Generating chart for ${key || 'ALL'}...`);
            const buffer = await generateChart(history, key);
            const filename = `test_chart_${key || 'ALL'}.png`;
            fs.writeFileSync(filename, buffer);
            console.log(`Saved ${filename}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
