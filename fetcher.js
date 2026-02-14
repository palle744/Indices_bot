const axios = require('axios');
const cheerio = require('cheerio');

const URLS = {
    tipos: 'https://www.banxico.org.mx/tipcamb/llenarTiposCambioAction.do?idioma=sp',
    tasas: 'https://www.banxico.org.mx/tipcamb/llenarTasasInteresAction.do?idioma=sp',
    inflacion: 'https://www.banxico.org.mx/tipcamb/llenarInflacionAction.do?idioma=sp'
};

const IDS = {
    TC: 'SF43718', // Correct ID for Dollar FIX
    TIIE: 'SF331451',
    CETES: 'CA0_DATO', // Note: This ID might change or require different selector logic
    INPC: 'SP30578'
};

async function fetchHtml(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return cheerio.load(response.data);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

async function fetchIndicators() {
    const results = {
        TC: null,
        TIIE: null,
        CETES: null,
        INPC: null,
        MEZCLA: 'N/A' // Not found on Banxico
    };

    // 1. Fetch Tipos de Cambio
    const $tipos = await fetchHtml(URLS.tipos);
    if ($tipos) {
        let tcVal = $tipos(`#dato${IDS.TC}`).text().trim();
        if (!tcVal) tcVal = $tipos(`div#dato${IDS.TC}`).text().trim();
        if (!tcVal) tcVal = $tipos(`#td${IDS.TC}`).text().trim(); // Fallback for 'td' prefix
        if (!tcVal) tcVal = $tipos(`div#td${IDS.TC}`).text().trim();
        results.TC = tcVal;
    }

    // 2. Fetch Tasas
    const $tasas = await fetchHtml(URLS.tasas);
    if ($tasas) {
        results.TIIE = $tasas(`#td${IDS.TIIE}`).text().trim() || $tasas(`div#td${IDS.TIIE}`).text().trim();
        results.CETES = $tasas(`#${IDS.CETES}`).text().trim() || $tasas(`div#${IDS.CETES}`).text().trim();
    }

    // 3. Fetch Inflacion
    const $inflacion = await fetchHtml(URLS.inflacion);
    if ($inflacion) {
        results.INPC = $inflacion(`#td${IDS.INPC}`).text().trim() || $inflacion(`div#td${IDS.INPC}`).text().trim();
    }

    // 4. Fetch Mezcla Mexicana (Banxico JSON)
    try {
        const url = 'https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SI744,CI38';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const series = data.valores;
            for (let i = series.length - 1; i >= 0; i--) {
                const point = series[i];
                const val = point[1];
                if (val !== -989898 && val !== null && val !== 'N/E') {
                    results.MEZCLA = val; // Store the price
                    break;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching Mezcla Mexicana:', e.message);
    }

    // 5. Fetch Euro (Banxico JSON)
    try {
        const url = 'https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SF46410,CF102';
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            const series = data.valores;
            // Get last valid value
            for (let i = series.length - 1; i >= 0; i--) {
                const point = series[i];
                const val = point[1];
                if (val !== -989898 && val !== null && val !== 'N/E') {
                    results.EURO = val;
                    break;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching Euro:', e.message);
        results.EURO = 'N/A';
    }

    // 6. Calculate Euro/USD
    if (results.TC && results.EURO && results.TC !== 'N/A' && results.EURO !== 'N/A') {
        const tcVal = parseFloat(results.TC);
        const euroVal = parseFloat(results.EURO);
        if (!isNaN(tcVal) && !isNaN(euroVal) && tcVal !== 0) {
            results.EURO_USD = (euroVal / tcVal).toFixed(4);
        } else {
            results.EURO_USD = 'N/A';
        }
    } else {
        results.EURO_USD = 'N/A';
    }

    return results;
}

module.exports = { fetchIndicators };
