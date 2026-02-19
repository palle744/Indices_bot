const axios = require('axios');

async function debugMezcla() {
    console.log('Fetching Mezcla data from Banxico...');
    const url = 'https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SI744,CI38';
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const series = data.valores;
            console.log(`Total data points: ${series.length}`);

            // Print last 5 points
            console.log('Last 5 data points: (Date, Value)');
            for (let i = series.length - 5; i < series.length; i++) {
                if (i >= 0) {
                    console.log(JSON.stringify(series[i]));
                }
            }

            // Logic from fetcher.js
            let found = 'N/A';
            for (let i = series.length - 1; i >= 0; i--) {
                const point = series[i];
                const val = point[1];
                if (val !== -989898 && val !== null && val !== 'N/E') {
                    found = val;
                    console.log(`\nFetcher would pick: ${point[0]} -> ${val}`);
                    break;
                }
            }
        } else {
            console.log('No data values found in response.');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

debugMezcla();
