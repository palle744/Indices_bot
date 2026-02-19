require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { fetchIndicators } = require('./fetcher');

// Retrieve token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not defined in .env file');
    process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log('Bot is running...');

const { getIndicatorsHistory } = require('./historyFetcher');
const { generateChart } = require('./chartGenerator');

// Matches "/start" or "/indicadores"
// Match "/start"
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const message = `
🤖 *Bienvenido al Bot Financiero de Banxico* 🇲🇽

Estos son los comandos disponibles:
✅ */start* - Muestra este mensaje de ayuda.
📊 */indicadores* - Muestra los indicadores financieros actuales (TC, TIIE, Cetes, INPC, Mezcla) y permite generar gráficas.

⚠️ *Nota:* Se mostrará una alerta si algún indicador varía más del *1.5%* respecto al día anterior.
    `;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Match "/indicadores"
bot.onText(/\/indicadores/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received /indicadores from ${chatId}`);

    bot.sendMessage(chatId, 'Obteniendo datos de Banxico, por favor espere...');

    try {
        console.log('Calling fetchIndicators()...');
        const data = await fetchIndicators();
        // Fetch history to compare
        const history = await getIndicatorsHistory();

        let alerts = '';
        const threshold = 1.5; // 1.5%

        const checkVolatility = (name, current, historyData) => {
            if (current && current !== 'N/A' && historyData && historyData.length > 0) {
                const last = historyData[historyData.length - 1];
                if (last && last.value) {
                    const prev = parseFloat(last.value);
                    const curr = parseFloat(current);
                    if (!isNaN(prev) && !isNaN(curr) && prev !== 0) {
                        const change = ((curr - prev) / prev) * 100;
                        if (Math.abs(change) >= threshold) {
                            return `\n⚠️ *${name}* varió un *${change.toFixed(2)}%* (Anterior: ${prev})`;
                        }
                    }
                }
            }
            return '';
        };

        alerts += checkVolatility('TC', data.TC, history.TC);
        alerts += checkVolatility('Euro', data.EURO, history.EURO);
        alerts += checkVolatility('Mezcla', data.MEZCLA, history.MEZCLA);

        const message = `${alerts ? `🚨 *ALERTAS DE VOLATILIDAD:*${alerts}\n\n` : ''}
📊 *Indicadores Financieros (Banxico)* 🇲🇽

💵 *TC (Fix):* ${data.TC || 'No disponible'}
💶 *Euro:* ${data.EURO || 'No disponible'}
💱 *Euro/USD:* ${data.EURO_USD || 'No disponible'}
🏦 *TIIE (28 días):* ${data.TIIE || 'No disponible'}
📈 *Cetes (28 días):* ${data.CETES || 'No disponible'}
🛒 *INPC:* ${data.INPC || 'No disponible'}
🛢️ *Mezcla Mexicana:* ${data.MEZCLA}

_Datos obtenidos del sitio oficial de Banxico._
        `;

        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📉 Todo', callback_data: 'get_graph_all' },
                        { text: '💵 TC', callback_data: 'get_graph_TC' },
                        { text: '💶 Euro', callback_data: 'get_graph_EURO' }
                    ],
                    [
                        { text: '💱 Euro/USD', callback_data: 'get_graph_EURO_USD' },
                        { text: '🏦 TIIE', callback_data: 'get_graph_TIIE' },
                        { text: '📈 Cetes', callback_data: 'get_graph_CETES' }
                    ],
                    [
                        { text: '🛒 INPC', callback_data: 'get_graph_INPC' },
                        { text: '🛢️ Mezcla', callback_data: 'get_graph_MEZCLA' }
                    ]
                ]
            }
        };

        console.log('Sending message with data...');
        await bot.sendMessage(chatId, message, opts);
        console.log('Message sent successfully.');

    } catch (error) {
        console.error('Error in /indicadores handler:', error);
        bot.sendMessage(chatId, 'Ocurrió un error al obtener los datos: ' + error.message);
    }
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const action = callbackQuery.data;

    if (action.startsWith('get_graph')) {
        const type = action.split('_')[2]; // undefined (all), TC, TIIE, etc.
        const filterKey = (type === 'all' || !type) ? null : type;

        bot.answerCallbackQuery(callbackQuery.id, { text: 'Generando gráfica...' });

        try {
            bot.sendChatAction(chatId, 'upload_photo');
            const history = await getIndicatorsHistory();
            const imageBuffer = await generateChart(history, filterKey);

            const caption = filterKey
                ? `📉 Comportamiento de ${filterKey} (30 días)`
                : '📉 Comportamiento histórico de los últimos 30 días';

            await bot.sendPhoto(chatId, imageBuffer, { caption });
        } catch (error) {
            console.error('Error generating graph:', error);
            bot.sendMessage(chatId, 'Lo siento, ocurrió un error al generar la gráfica.');
        }
    }
});

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('Polling Error:', error.message);  // Log full message
    console.error(error); // Log full object for details
});
