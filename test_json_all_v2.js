const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors
const agent = new https.Agent({
    rejectUnauthorized: false
});

const SERIES_IDS = {
    TC: 'SF43718',
    TIIE: 'SF43783',
    CETES: 'SF43936',
    INPC: 'SP1',
    MEZCLA: 'SI744,CI38', // Added suffix found in fetcher.js
    EURO: 'SF46410'
};

async function fetchSeriesData(seriesId) {
    const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${seriesId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
            },
            httpsAgent: agent
        });
        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const last = data.valores[data.valores.length - 1]; // Get the very last one
            return { value: last[1], date: last[0], seriesId };
        }
    } catch (e) {
        console.error(`Error fetching ${seriesId}:`, e.message);
    }
    return null;
}

async function testAll() {
    console.log('Testing JSON fetch for all indicators...');
    for (const [key, id] of Object.entries(SERIES_IDS)) {
        const result = await fetchSeriesData(id);
        console.log(`${key}:`, result);
    }
}

testAll();
