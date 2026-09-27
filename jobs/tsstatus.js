const fs = require('fs');

async function pingSite() {
    try {
        const response = await fetch('https://teknoseyir.com/');

        return {
            ok: response.ok,
            status: response.status
        };
    } catch {
        return {
            ok: false,
            status: 'ERROR'
        };
    }
}

async function updateJsonFileRead(newData) {
    const filePath = './ts/read.json';

    try {
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        data.push(newData);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('read.json file has been successfully updated.');
    } catch (error) {
        console.error('An error occurred while updating the JSON read.json file:', error);
    }
}

async function updateJsonFileLive(newData) {
    const filePath = './ts/live.json';

    try {
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        data.date = newData.date;
        data.text = newData.text;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log('live.json file has been successfully updated.');
    } catch (error) {
        console.error('An error occurred while updating the JSON live.json file:', error);
    }
}

async function main() {
    const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const pingResult = await pingSite();

    const newData = {
        date: timestamp,
        text: pingResult && pingResult.ok ? 'OK' : 'ERROR'
    };

    await updateJsonFileRead(newData);
    await updateJsonFileLive(newData);
}

main();
