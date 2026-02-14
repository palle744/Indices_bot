const axios = require('axios');

async function testFetch() {
    try {
        const url = 'https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SI744,CI38';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;
        if (!data || !data.valores) {
            console.log('No data found');
            return;
        }

        const series = data.valores;
        console.log(`Total data points: ${series.length}`);

        // Iterate backwards only locally, mimicking real logic
        let latestEntry = null;
        for (let i = series.length - 1; i >= 0; i--) {
            const point = series[i];
            const val = point[1];
            // Check for invalid values based on 23es1.js logic
            if (val !== -989898 && val !== null && val !== 'N/E') {
                latestEntry = {
                    date: point[0],
                    price: val
                };
                break;
            }
        }

        console.log('Latest Entry:', latestEntry);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testFetch();
