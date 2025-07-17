const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

// Get URLs from environment variable
const urlsToProcess = process.env.URLS_TO_PROCESS ? 
    process.env.URLS_TO_PROCESS.split(',') : 
    [];

if (urlsToProcess.length === 0) {
    console.error('No URLs found in .env file. Please add URLs_TO_PROCESS to your .env file.');
    process.exit(1);
}

console.log(`Found ${urlsToProcess.length} URLs to process:`);
urlsToProcess.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
});

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Load cookies
    const cookiesString = fs.readFileSync('./linkedin-cookies.json', 'utf8');
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);

    // Process each URL
    for (const url of urlsToProcess) {
        console.log(`\nProcessing: ${url}`);
        
        try {
            // Navigate to the URL
            await page.goto(url, { waitUntil: 'networkidle2' });

            // Scroll to load posts
            await autoScroll(page);

            // Get all posts
            const postSelectors = await page.$$('div.feed-shared-update-v2');

            console.log(`Found ${postSelectors.length} posts on this page`);

            for (const post of postSelectors) {
                const likeButton = await post.$('button[aria-label*="Like"]');
                const pressed = await post.$('button[aria-pressed="true"]');

                if (!pressed && likeButton) {
                    console.log('Liking a post...');
                    await likeButton.click();
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Slow down to mimic human behavior
                } else {
                    console.log('Already liked this post, skipping.');
                }
            }

            console.log(`Finished processing: ${url}`);
            
            // Add a delay between processing different URLs
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error) {
            console.error(`Error processing ${url}:`, error.message);
            continue; // Continue with next URL even if one fails
        }
    }

    console.log('\nAll URLs processed.');
    await browser.close();
})();

// Auto-scroll helper
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= 2000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}