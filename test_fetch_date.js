const { fetchIndicators } = require('./fetcher');

async function test() {
    console.log('Fetching indicators...');
    try {
        const data = await fetchIndicators();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
