const { fetchIndicators } = require('./fetcher');
const { getIndicatorsHistory } = require('./historyFetcher');

async function testVolatility() {
    console.log('Testing Volatility Logic...');

    // Mock data for testing
    const current = {
        TC: '20.50',
        EURO: '22.00',
        MEZCLA: '70.00'
    };

    const history = {
        TC: [{ date: '2023-10-01', value: 20.00 }], // 2.5% increase (Alert)
        EURO: [{ date: '2023-10-01', value: 21.90 }], // 0.45% increase (No Alert)
        MEZCLA: [{ date: '2023-10-01', value: 72.00 }] // -2.7% decrease (Alert)
    };

    const threshold = 1.5;

    const checkVolatility = (name, currentVal, historyData) => {
        if (currentVal && historyData && historyData.length > 0) {
            const last = historyData[historyData.length - 1];
            const prev = parseFloat(last.value);
            const curr = parseFloat(currentVal);

            console.log(`Checking ${name}: Curr=${curr}, Prev=${prev}`);

            if (!isNaN(prev) && !isNaN(curr) && prev !== 0) {
                const change = ((curr - prev) / prev) * 100;
                console.log(`  Change: ${change.toFixed(2)}%`);

                if (Math.abs(change) >= threshold) {
                    return `⚠️ *${name}* varió un *${change.toFixed(2)}%* (Anterior: ${prev})`;
                }
            }
        }
        return null;
    };

    const alertTC = checkVolatility('TC', current.TC, history.TC);
    const alertEuro = checkVolatility('Euro', current.EURO, history.EURO);
    const alertMezcla = checkVolatility('Mezcla', current.MEZCLA, history.MEZCLA);

    console.log('\n--- Results ---');
    console.log('TC Alert:', alertTC || 'None'); // Should be alert
    console.log('Euro Alert:', alertEuro || 'None'); // Should be none
    console.log('Mezcla Alert:', alertMezcla || 'None'); // Should be alert
}

testVolatility();
