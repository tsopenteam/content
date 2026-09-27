const fs = require('fs');

async function pingSite() {
    try {
        const response = await fetch('https://teknoseyir.com/');

        console.log('-------------------------------------------------------------');
        console.log('STATUS:', response.status);
        console.log('STATUS TEXT:', response.statusText);
        console.log('OK:', response.ok);
        console.log('URL:', response.url);
        console.log('REDIRECTED:', response.redirected);
        console.log('TYPE:', response.type);
        console.log('HEADERS:', Object.fromEntries(response.headers));
        console.log('-------------------------------------------------------------');

        return {
            ok: response.ok,
            status: response.status
        };
    } catch (error) {
        console.error('FETCH ERROR:', error);

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
