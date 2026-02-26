
async function run() {
    const res = await fetch('https://t.me/s/kyplu_prodam_sahalin', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const text = await res.text();
    console.log(text.substring(0, 1000));
    console.log('---');
    if (text.includes('tgme_widget_message_text')) {
        console.log('Found messages!');
    } else {
        console.log('No messages found.');
    }
}
run();
