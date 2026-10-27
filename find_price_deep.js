const axios = require('axios');

async function test(id) {
    try {
        const res = await axios.get(`https://fr.aliexpress.com/item/${id}.html`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept-Language': 'fr-FR,fr;q=0.9',
                'Cookie': 'aep_usuc_f=site=fra&b_locale=fr_FR&c_tp=EUR&region=FR;'
            },
            timeout: 10000
        });
        console.log('Status:', res.status, 'Len:', res.data.length);
        // Look for any 3 digits or numbers
        const numbers = res.data.match(/\b\d{2,3}[.,]\d{2}\b/g) || [];
        console.log('Numbers with 2 decimals:', Array.from(new Set(numbers)).slice(0, 15));
    } catch(e) {
        console.error('Error:', e.message);
    }
}

test('1005013234055626');
