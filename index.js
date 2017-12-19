/**
 *
 * @TODO:
 *  - Add historical pricing
 *  - CLI to add price data
 *  - CLI to check specific price by ?
 */
const puppeteer = require('puppeteer');
const accounting = require('accounting');
const colors = require('colors');
const argv = require('yargs').argv;

const priceSourcesJson = require('./sources.json');

const Price = require('./app/models/price');

// create a new price
// const price = new Price({
//   title: 'PS4 VR',
// });

// call the custom method. this will the title replace spaces with dashes
// price will now be "PS4-VR"
// price.kebab((err, title) => {
//   if (err) throw err;
//
//   console.log('Your new price title is ' + title);
// });

// call the built-in save method to save to the database
// price.save(function(err) {
//   if (err) throw err;
//
//   console.log(price.title, 'Price saved successfully!');
// });



// Parse sources json @TODO turn this into rest endpoint
const priceSources = JSON.parse(JSON.stringify(priceSourcesJson));

/**
 * Convert the price string to an integer for math
 */
const stringPriceToInt = (price, decimals = 2) => accounting.toFixed(price, decimals);

/**
 * Format the price all pretty-like
 */
const formatPrice = (price, symbol = '$') => accounting.formatMoney(price, symbol);

/**
 * Return the difference of the price
 */
const formatPriceDifference = (basePrice, currentPrice, symbol = '$') => {
    const diff = currentPrice - basePrice;

    if (diff === 0) {
        return 'None';
    } else if (diff < 0) {
        return formatPrice(-diff, `Decrease of: ${symbol}`);
    } else {
        return formatPrice(+diff, `Increase of: ${symbol}`);
    }
};


/**
 *
 */
const scrape = async (priceData) => {
    const browser = await puppeteer.launch({
        // headless: false,
    });
    const url = priceData.url;
    const sourceName = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/i)[1]; // /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i
    const page = await browser.newPage();

    // Log
    console.log('Scraping...'.bgCyan.black.bold);

    // Navigation
    await page.goto(`${url}`); // , { waitUntil: ['load', 'domcontentloaded'] }
    console.log(`Opening url `.cyan.bold, '\n', `"${url}"`.cyan.underline);

    // // Base pricing
    // const basePriceStr = priceSources.sources[i].basePrice;
    // const basePriceInt = stringPriceToInt(basePriceStr.replace(/\s/mg, ''));
    // const basePriceFormatted = formatPrice(basePriceInt, '$');
    // Scraped pricing
    console.log(`Scraping price selector `.cyan.bold, '\n', `"${priceData.selector}"`.cyan);
    const currentPriceElement = await page.$(priceData.selector);
    const currentPriceStr = await page.evaluate((currentPriceElement) => currentPriceElement.textContent.replace(/\s/mg, ''), currentPriceElement);
    const currentPriceInt = await stringPriceToInt(currentPriceStr);
    const currentPriceFormatted = await formatPrice(currentPriceInt, '$');
    // // Price difference
    // const priceDiff = await formatPriceDifference(basePriceInt, currentPriceInt);

    //
    await console.info(
      '\n',
      'Getting price for'.green.bold, priceData.title.green.bold.italic,
      'from'.green.bold, sourceName.green.bold.italic.underline,
      '\n',
      // 'Previous price:'.green, basePriceFormatted.green,
      'Current price:'.green, currentPriceFormatted.green,
      // '| Price '.green, priceDiff.green,
      '\n',
    );



    // screenie
    await page.screenshot({
        path: `screens/price-${sourceName}.png`,
        clip: {
            x:      0,
            y:      0,
            width:  1200,
            height: 1200,
        },
    });

    // await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await browser.close();

    console.log(`Complete, exiting...`.white);
    process.exit();
};


/**
 *
 */
const init = (function() {

  // With CLI args, new price
  if (argv.title || argv.url || argv.selector) {

    // CLI arguments check
    if (typeof argv.title === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `title` argument: --title="My Product"'.red);
      process.exit(1);
    }
    if (typeof argv.url === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `url` argument: --url="https://mystore.com/my-product"'.red);
      process.exit(1);
    }
    if (typeof argv.selector === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `selector` argument: --selector=".price-selector"'.red);
      process.exit(1);
    }

    /** @type {Price} */
    const price = new Price({
      title: argv.title,
      url: argv.url,
      selector: argv.selector,
    });

    // Log
    console.log('Creating new price:'.gray.bold, '\n', `${price}`.gray, '\n');

    // Try the to scrap()
    try {
      scrape(price);
    } catch(e) {
      console.error('Cannot run scraper:'.red, e.red);
      process.exit(1);
    }
  } else {
    // Scrape stored prices
  }
}());
