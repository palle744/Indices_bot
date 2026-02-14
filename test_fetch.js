const https = require('https');

const seriesIds = [
    'SF46410', 'SF46406', 'SF60632', // Tipos
    'SP30577', 'SP68257', // Inflacion candidates
    'SF61745', 'SF331451', 'SF43773', 'SF43774', 'SF60648', 'SF60649', 'SF118281' // Tasas candidates
];

const date = '13/02/2026'; // Try a recent valid date (Friday before the weekend?)

// Construct URL
const url = `https://www.banxico.org.mx/tipcamb/datosieajax?accion=dato&idSeries=SF46410&decimales=4&fecha=${date}`;

console.log(`Fetching: ${url}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("Raw output:", data);
        }
    });
}).on('error', err => {
    console.error('Error:', err.message);
});
