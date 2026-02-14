const axios = require('axios');

const seriesId = 'SF46410'; // Euro
const cuadros = ['CF102', 'CF373', 'CF86', 'CF307', 'CF101', 'CF107', 'CP154', 'CF300', 'CF301', 'CF302', 'CF303', 'CF304', 'CF305', 'CF306', 'CF308'];

async function testCuadro(cuadro) {
    const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${seriesId},${cuadro}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 5000
        });

        const data = response.data;
        // Check if data is valid JSON and has values
        if (data && data.valores && data.valores.length > 0) {
            console.log(`✅ Success (Historical): ${seriesId},${cuadro}`);
            console.log(`   Last Point: ${JSON.stringify(data.valores[data.valores.length - 1])}`);
            return true;
        } else {
            // console.log(`❌ Invalid Data: ${seriesId},${cuadro}`);
        }
    } catch (e) {
        // console.log(`❌ Error: ${seriesId},${cuadro} - ${e.message}`);
    }
    return false;
}

async function run() {
    console.log(`Testing Series ID ${seriesId} with various Cuadros...`);
    for (const cuadro of cuadros) {
        if (await testCuadro(cuadro)) {
            break;
        }
    }
}

run();
