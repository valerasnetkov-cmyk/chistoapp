const TelegramBot = require('node-telegram-bot-api');
const token = '8232256174:AAHmSbVarnGDwKYCeGNI0Qp4XjZZiuD4Aa8';
const bot = new TelegramBot(token, { polling: true });

console.log('--- TEST BOT STARTING ---');

bot.on('message', (msg) => {
    console.log('DEBUG: Received message:', msg.text, 'from:', msg.from.id);
    bot.sendMessage(msg.chat.id, 'Я тебя слышу! Если ты видишь это сообщение, значит бот работает. Сейчас попробую отправить кнопки.', {
        reply_markup: {
            keyboard: [[{ text: '🚀 ОТКРЫТЬ ПРИЛОЖЕНИЕ', web_app: { url: 'https://chistoapp.ru' } }]],
            resize_keyboard: true
        }
    }).then(() => console.log('DEBUG: Test message sent!'))
      .catch(err => console.error('DEBUG: Send error:', err));
});

bot.on('polling_error', (err) => console.error('DEBUG: Polling error:', err));
