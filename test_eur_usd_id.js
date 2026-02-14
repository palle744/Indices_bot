const axios = require('axios');

const seriesId = 'SF46406'; // Potential Euro/USD
const cuadros = ['CF102', 'CF373', 'CF86', 'CF101', 'CF307']; // Common cuadros

async function testCuadro(cuadro) {
    const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${seriesId},${cuadro}`;
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            console.log(`✅ Success: ${seriesId},${cuadro}`);
            const last = data.valores[data.valores.length - 1];
            console.log(`   Last Point: ${JSON.stringify(last)}`);
            return true;
        }
    } catch (e) {
        // console.log(`Error: ${e.message}`);
    }
    return false;
}

async function run() {
    console.log(`Testing potential EUR/USD ID ${seriesId}...`);
    for (const cuadro of cuadros) {
        if (await testCuadro(cuadro)) break;
    }
}

run();
