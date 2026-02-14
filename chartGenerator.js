const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800; // px
const height = 600; // px
const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
};

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

async function generateChart(historyData, filterKey = null) {
    // Determine overlapping period (intersection of dates to keep chart clean?)
    // Or just plot everything on their own dates. 
    // Since business days match mostly, we can just use the dates from one series or union.
    // However, chart.js handles labels well. We need a common set of labels (dates).

    // Collect all unique dates and sort them
    const allDates = new Set();
    Object.values(historyData).forEach(series => {
        series.forEach(point => allDates.add(point.date));
    });
    const labels = Array.from(allDates).sort();

    // Prepare datasets
    const datasets = [];
    const colors = {
        TC: 'rgba(75, 192, 192, 1)',
        TIIE: 'rgba(255, 99, 132, 1)',
        INPC: 'rgba(54, 162, 235, 1)',
        CETES: 'rgba(255, 206, 86, 1)',
        MEZCLA: 'rgba(153, 102, 255, 1)',
        EURO: 'rgba(255, 159, 64, 1)',
        EURO_USD: 'rgba(255, 99, 132, 1)' // Reuse or new color? Let's use a new one or reuse.
    };

    const keysToProcess = filterKey ? [filterKey] : Object.keys(historyData);

    for (const key of keysToProcess) {
        const data = historyData[key];
        if (!data) continue;

        // Map data to the common labels
        const dataPoints = labels.map(date => {
            const point = data.find(p => p.date === date);
            return point ? point.value : null; // null breaks the line, spanning is better?
            // Chart.js spanGaps: true
        });

        datasets.push({
            label: key,
            data: dataPoints,
            borderColor: colors[key] || 'black',
            backgroundColor: colors[key] ? colors[key].replace('1)', '0.2)') : 'grey',
            fill: !!filterKey, // Fill area if single chart
            tension: 0.3,
            spanGaps: true
        });
    }

    const title = filterKey
        ? `Comportamiento de ${filterKey} (30 días)`
        : 'Indicadores Financieros (Últimos 30 días)';

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: !filterKey // Hide legend if single chart
                }
            }
        }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

module.exports = { generateChart };
