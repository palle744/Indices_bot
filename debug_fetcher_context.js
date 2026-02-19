const axios = require('axios');
const cheerio = require('cheerio');

async function debugContext() {
    const urls = [
        { name: 'TC', url: 'https://www.banxico.org.mx/tipcamb/main.do?page=tip&idioma=sp', selector: '#SF43718' },
        { name: 'TIIE', url: 'https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CF107&sector=18&locale=es', selector: '#SF43783' },
        { name: 'INPC', url: 'https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CP154&sector=8&locale=es', selector: '#SP1' }
    ];

    const HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    for (const item of urls) {
        try {
            console.log(`Fetching ${item.name}...`);
            const response = await axios.get(item.url, { headers: HEADERS });
            const $ = cheerio.load(response.data);
            const val = $(item.selector).text().trim();
            console.log(`${item.name} Value: ${val}`);

            // Log the text of the parent element and its siblings to find a date
            const parentEntry = $(item.selector).closest('tr').text().replace(/\s+/g, ' ').trim();
            console.log(`${item.name} Row Context: ${parentEntry}`);

            // Also check the previous row or header if date is there
            const header = $(item.selector).closest('table').find('thead').text().replace(/\s+/g, ' ').trim();
            console.log(`${item.name} Header Context: ${header.substring(0, 100)}...`);

        } catch (e) {
            console.error(`Error fetching ${item.name}:`, e.message);
        }
        console.log('---');
    }
}

debugContext();
