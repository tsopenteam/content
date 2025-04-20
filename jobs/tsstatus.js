const fs = require('fs');
const axios = require('axios');

async function pingTeknoSeyir() {
    try {
        const response = await axios.get('https://teknoseyir.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://teknoseyir.com/'
            }
        });
        return { status: 'OK', code: response.status };
    } catch (error) {
        return { status: `ERROR: ${error.response ? error.response.status : 'Unknown error'}` };
    }
}

async function updateJsonFile(newData) {
    const filePath = './ts/read.json';

    try {
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        data.push(newData);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('read.json file has been successfully updated.');
    } catch (error) {
        console.error('An error occurred while updating the JSON file:', error);
    }
}

async function main() {
    const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const pingResult = await pingTeknoSeyir();
    const newData = {
        date: timestamp,
        text: pingResult.status
    };

    await updateJsonFile(newData);
}

main();