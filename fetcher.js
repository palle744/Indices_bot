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
    CETES: 'CA0_DATO',
    INPC: 'SP30578'
};

/* Helper to find a date (DD/MM/YYYY) in a string text */
function extractDate(text) {
    if (!text) return '';
    // Look for DD/MM/YYYY
    const dates = text.match(/(\d{2}\/\d{2}\/\d{4})/g);
    if (dates && dates.length > 0) {
        // Return the last found date as it is usually the most relevant "Fecha de determinación" or similar at bottom
        // Or the first one? Let's try to find one near the value?
        // Usually Banxico puts date in a header or next to value.
        // Let's return the first one found in the text dump.
        return dates[0];
    }
    return '';
}

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

/* Helper to format YYYY-MM-DD to DD/MM/YYYY */
function formatDate(isoDate) {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

async function fetchIndicators() {
    const results = {
        TC: { value: 'N/A', date: '' },
        TIIE: { value: 'N/A', date: '' },
        CETES: { value: 'N/A', date: '' },
        INPC: { value: 'N/A', date: '' },
        MEZCLA: { value: 'N/A', date: '' },
        EURO: { value: 'N/A', date: '' }
    };

    // 1. Fetch Tipos de Cambio
    const $tipos = await fetchHtml(URLS.tipos);
    if ($tipos) {
        let tcVal = $tipos(`#dato${IDS.TC}`).text().trim();
        if (!tcVal) tcVal = $tipos(`div#dato${IDS.TC}`).text().trim();
        if (!tcVal) tcVal = $tipos(`#td${IDS.TC}`).text().trim();
        if (!tcVal) tcVal = $tipos(`div#td${IDS.TC}`).text().trim();

        // Extract date from the whole body text
        const pageText = $tipos('body').text();
        const date = extractDate(pageText);

        if (tcVal) results.TC = { value: tcVal, date };
    }

    // 2. Fetch Tasas
    const $tasas = await fetchHtml(URLS.tasas);
    if ($tasas) {
        const tiieVal = $tasas(`#td${IDS.TIIE}`).text().trim() || $tasas(`div#td${IDS.TIIE}`).text().trim();
        const cetesVal = $tasas(`#${IDS.CETES}`).text().trim() || $tasas(`div#${IDS.CETES}`).text().trim();

        const pageText = $tasas('body').text();
        const date = extractDate(pageText);

        if (tiieVal) results.TIIE = { value: tiieVal, date };
        if (cetesVal) results.CETES = { value: cetesVal, date };
    }

    // 3. Fetch Inflacion
    const $inflacion = await fetchHtml(URLS.inflacion);
    if ($inflacion) {
        const inpcVal = $inflacion(`#td${IDS.INPC}`).text().trim() || $inflacion(`div#td${IDS.INPC}`).text().trim();
        const pageText = $inflacion('body').text();
        const date = extractDate(pageText);

        if (inpcVal) results.INPC = { value: inpcVal, date };
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
                    results.MEZCLA = { value: val, date: formatDate(point[0]) };
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
            for (let i = series.length - 1; i >= 0; i--) {
                const point = series[i];
                const val = point[1];
                if (val !== -989898 && val !== null && val !== 'N/E') {
                    results.EURO = { value: val, date: formatDate(point[0]) };
                    break;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching Euro:', e.message);
    }

    // 6. Calculate Euro/USD
    // Handle both object and value cases for robustness
    const tc = typeof results.TC === 'object' ? results.TC.value : results.TC;
    const euro = typeof results.EURO === 'object' ? results.EURO.value : results.EURO;

    if (tc && euro && tc !== 'N/A' && euro !== 'N/A') {
        const tcVal = parseFloat(tc);
        const euroVal = parseFloat(euro);
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
