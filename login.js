const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login');

    console.log('Log in manually, then press any key here to continue...');
    process.stdin.once('data', async () => {
        const cookies = await page.cookies();
        fs.writeFileSync('./linkedin-cookies.json', JSON.stringify(cookies, null, 2));
        console.log('Cookies saved!');
        await browser.close();
        process.exit();
    });
})();
