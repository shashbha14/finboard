const http = require('http');

function check(name) {
    const url = `http://localhost:3000/api/indianapi?name=${name}`;
    console.log(`Fetching ${url}...`);
    http.get(url, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`[${name}] Status:`, res.statusCode);
            console.log(`[${name}] Body:`, data);
        });
    }).on('error', e => console.error(e));
}

check('AAPL');
check('RELIANCE');
