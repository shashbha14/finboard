const https = require('https');

const API_KEY = 'sk-live-RgtAJsTIcOe1ee1ygYBbSozk5QGyxkNrLrX5HcI6';

function checkStock(name) {
    const url = `https://stock.indianapi.in/stock?name=${name}`;
    console.log(`Checking ${name}...`);

    https.get(url, {
        headers: { 'X-Api-Key': API_KEY }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`[${name}] Status:`, res.statusCode);
            console.log(`[${name}] Body:`, data);
        });
    }).on('error', (e) => {
        console.error(`[${name}] Error:`, e.message);
    });
}

checkStock('AAPL');
checkStock('RELIANCE');
