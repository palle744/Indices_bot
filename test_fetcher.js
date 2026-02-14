const { fetchIndicators } = require('./fetcher');

async function testFetch() {
    console.log('Testing fetchIndicators()...');
    try {
        const data = await fetchIndicators();
        console.log('Result:', data);
    } catch (error) {
        console.error('Error fetching indicators:', error);
    }
}

testFetch();
