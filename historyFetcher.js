const axios = require('axios');

const SERIES_IDS = {
    TC: 'SF43718,CF102',     // Fix
    TIIE: 'SF43783,CF101',   // TIIE 28
    INPC: 'SP1,CP154',      // INPC
    CETES: 'SF43936,CF107',  // Cetes 28
    EURO: 'SF46410,CF102'    // Euro
};

async function fetchHistory(seriesId) {
    try {
        const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${seriesId}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            return data.valores
                .map(point => ({
                    date: point[0], // YYYY-MM-DD
                    value: parseFloat(point[1])
                }))
                .filter(p => p.value !== -989898 && !isNaN(p.value)); // Filter invalid data
        }
        return [];
    } catch (error) {
        console.error(`Error fetching history for ${seriesId}:`, error.message);
        return [];
    }
}

async function getIndicatorsHistory() {
    const history = {};

    // Fetch all series in parallel
    const promises = Object.entries(SERIES_IDS).map(async ([key, id]) => {
        const data = await fetchHistory(id);
        // Filter last 30 entries (approx one month of business days)
        // Or filter by date. Let's filter by last 30 points to be safe.
        history[key] = data.slice(-30);
    });

    // Fetch Mezcla Mexicana separately using its specific URL/Logic if needed
    // But wait, the Mezcla logic in fetcher.js used the same endpoint logic 'SI744,CI38'
    // So we can add it to SERIES_IDS
    const mezclaPromise = (async () => {
        const data = await fetchHistory('SI744,CI38');
        history['MEZCLA'] = data.slice(-30);
    })();

    await Promise.all([...promises, mezclaPromise]);

    // Calculate Euro/USD history
    if (history.TC && history.EURO) {
        history.EURO_USD = [];
        // Iterate over EURO and find matching TC by date
        history.EURO.forEach(euroPoint => {
            const tcPoint = history.TC.find(p => p.date === euroPoint.date);
            if (tcPoint && tcPoint.value !== 0) {
                history.EURO_USD.push({
                    date: euroPoint.date,
                    value: parseFloat((euroPoint.value / tcPoint.value).toFixed(4))
                });
            }
        });
    }

    return history;
}

module.exports = { getIndicatorsHistory };
