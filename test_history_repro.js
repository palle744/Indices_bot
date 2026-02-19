const axios = require('axios');

const SERIES_IDS = {
    TC: 'SF43718',
    TIIE: 'SF43783',
    CETES: 'SF43936',
    INPC: 'SP1',
    EURO: 'SF46410',
    MEZCLA: 'SI744,CI38'
};

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
};

async function fetchHistory(id) {
    try {
        const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${id}`;
        const response = await axios.get(url, { headers: HEADERS });
        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const last = data.valores[data.valores.length - 1];
            return { value: last[1], date: last[0], id };
        }
    } catch (e) {
        console.error(`Error fetching ${id}:`, e.message);
    }
    return null;
}

async function test() {
    console.log('Testing history fetch logic...');
    for (const [key, id] of Object.entries(SERIES_IDS)) {
        const res = await fetchHistory(id);
        console.log(`${key}:`, res);
    }
}

test();
