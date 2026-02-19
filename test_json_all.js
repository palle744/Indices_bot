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
    MEZCLA: 'SI744',
    EURO: 'SF46410'
};

async function fetchSeriesData(seriesId) {
    const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${seriesId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            httpsAgent: agent
        });
        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const last = data.valores[data.valores.length - 1];
            return { value: last[1], date: last[0] };
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
