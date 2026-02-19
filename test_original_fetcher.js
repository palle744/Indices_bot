const { fetchIndicators } = require('./fetcher');

async function testOriginal() {
    console.log('Testing original fetcher...');
    try {
        const data = await fetchIndicators();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetcher error:', e);
    }
}

testOriginal();
