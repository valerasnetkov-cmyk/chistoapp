const TelegramBot = require('node-telegram-bot-api');
const token = '8232256174:AAHmSbVarnGDwKYCeGNI0Qp4XjZZiuD4Aa8';
const bot = new TelegramBot(token, { polling: true });

console.log('Test bot starting...');

bot.on('message', (msg) => {
    console.log('Received message:', msg.text, 'from:', msg.from.id);
    bot.sendMessage(msg.chat.id, 'Я тебя вижу! Кнопки должны быть ниже.', {
        reply_markup: {
            keyboard: [[{ text: '💧 Тест кнопки', web_app: { url: 'https://chistoapp.ru' } }]],
            resize_keyboard: true
        }
    }).then(() => console.log('Message sent!')).catch(err => console.error('Error:', err));
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});
