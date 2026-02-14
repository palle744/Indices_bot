const { getIndicatorsHistory } = require('./historyFetcher');

async function checkMezcla() {
    console.log('Fetching history...');
    const history = await getIndicatorsHistory();
    const mezcla = history['MEZCLA'];

    console.log('Mezcla Data (Last 30):');
    console.log(mezcla);
}

checkMezcla();
