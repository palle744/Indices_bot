const axios = require('axios');
const cheerio = require('cheerio');

async function debugHtml() {
    const urls = [
        { name: 'TC', url: 'https://www.banxico.org.mx/tipcamb/main.do?page=tip&idioma=sp', selector: '#SF43718' },
        { name: 'TIIE', url: 'https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CF107&sector=18&locale=es', selector: '#SF43783' },
        { name: 'INPC', url: 'https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?accion=consultarCuadro&idCuadro=CP154&sector=8&locale=es', selector: '#SP1' }
    ];

    for (const item of urls) {
        try {
            console.log(`Fetching ${item.name}...`);
            const response = await axios.get(item.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(response.data);
            const val = $(item.selector).text().trim();
            console.log(`${item.name} Value: ${val}`);

            // Try to find a date near the value
            // Strategy: Look for the parent row or nearby text
            const parentText = $(item.selector).parent().parent().text().replace(/\s+/g, ' ').trim();
            console.log(`${item.name} Context: ${parentText.substring(0, 200)}...`); // Log context

        } catch (e) {
            console.error(`Error fetching ${item.name}:`, e.message);
        }
    }
}

debugHtml();
