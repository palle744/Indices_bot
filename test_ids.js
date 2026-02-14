const axios = require('axios');

const IDS_TO_TEST = {
    TC: 'SF43718,CF102',     // Fix
    TIIE: 'SF43783,CF101',   // TIIE 28
    INPC: 'SP1,CP154',      // INPC
    CETES: 'SF43936,CF107'   // Cetes 28
};

async function testId(name, id) {
    try {
        const url = `https://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=${id}`;
        console.log(`Testing ${name} (${id})...`);
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const data = response.data;
        if (data && data.valores && data.valores.length > 0) {
            console.log(`✅ ${name}: Found ${data.valores.length} points.`);
            const last = data.valores[data.valores.length - 1];
            console.log(`   Last Point: Date=${last[0]}, Value=${last[1]}`);
        } else {
            console.log(`❌ ${name}: No data found.`);
        }
    } catch (e) {
        console.log(`❌ ${name}: Error ${e.message}`);
    }
}

async function run() {
    for (const [key, id] of Object.entries(IDS_TO_TEST)) {
        await testId(key, id);
    }
}

run();
