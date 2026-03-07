const fs = require('fs');
const axios = require('axios');
const net = require('net');
const { URL } = require('url');
let playwright;
let HttpsProxyAgent;

const PROXY = process.env.PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null;
if (PROXY) {
    try {
        HttpsProxyAgent = require('https-proxy-agent');
    } catch (e) {
        console.warn('https-proxy-agent not installed; proxy support for axios may be unavailable.');
    }
}

async function tcpCheck(host, port = 443, timeout = 5000) {
    return new Promise((resolve) => {
        const socket = net.connect(port, host);
        let finished = false;

        socket.on('connect', () => {
            finished = true;
            socket.destroy();
            resolve(true);
        });

        socket.on('error', () => {
            if (!finished) {
                finished = true;
                resolve(false);
            }
        });

        socket.setTimeout(timeout, () => {
            if (!finished) {
                finished = true;
                socket.destroy();
                resolve(false);
            }
        });
    });
}

async function pingTeknoSeyir() {
    const url = 'https://teknoseyir.com/';
    try {
        const axiosOpts = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        };

        if (PROXY && HttpsProxyAgent) {
            axiosOpts.httpsAgent = new HttpsProxyAgent(PROXY);
            axiosOpts.proxy = false;
        }

        const response = await axios.get(url, axiosOpts);

        return { ok: true, status: 'OK', code: response.status };
    } catch (error) {
        const statusCode = error.response ? error.response.status : null;
        const errCode = error.code || (statusCode ? `HTTP_${statusCode}` : 'Unknown');
        const host = new URL(url).hostname;
        const tcp = await tcpCheck(host, 443, 5000);

        if (statusCode) {
                // HTTP returned a code (e.g. 403). Try a real browser to bypass simple bot blocking.
                if (statusCode === 403) {
                    try {
                        if (!playwright) playwright = require('playwright');
                        const launchOpts = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
                        if (PROXY) launchOpts.proxy = { server: PROXY };

                        const browser = await playwright.chromium.launch(launchOpts);
                        const page = await browser.newPage();
                        const resp = await page.goto(url, { timeout: 20000, waitUntil: 'domcontentloaded' });
                        const bStatus = resp ? resp.status() : null;
                        await browser.close();

                        if (bStatus && bStatus < 400) {
                            return { ok: true, status: `OK (via browser ${bStatus})`, code: bStatus };
                        }
                        return { ok: false, status: `ERROR: ${statusCode} (HTTP blocked)`, tcp: tcp ? 'TCP_OK' : 'TCP_FAIL', browserStatus: bStatus };
                    } catch (brErr) {
                        return { ok: false, status: `ERROR: ${statusCode} (HTTP blocked)`, tcp: tcp ? 'TCP_OK' : 'TCP_FAIL', browserError: brErr.message };
                    }
                }

                return { ok: false, status: `ERROR: ${statusCode} (HTTP blocked)`, tcp: tcp ? 'TCP_OK' : 'TCP_FAIL' };
        }

        return { ok: false, status: `ERROR: ${errCode}`, tcp: tcp ? 'TCP_OK' : 'TCP_FAIL' };
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

    let text;
    if (pingResult.ok) {
        text = `OK (${pingResult.code})`;
    } else {
        text = pingResult.tcp ? `${pingResult.status} - ${pingResult.tcp}` : `${pingResult.status}`;
    }

    const newData = {
        date: timestamp,
        text
    };

    await updateJsonFile(newData);
}

main();
