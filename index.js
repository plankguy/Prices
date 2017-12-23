/**
 *
 * @TODO:
 *  - Add historical pricing
 *  - CLI to add price data
 *  - CLI to check specific price by ?
 */
const colors = require('colors');
const argv = require('yargs').argv;

// Pricing models
const Price = require('./app/models/price');

// Util methods
const utilLibs = require('./app/libs/utils');
const kebab = utilLibs.kebab;

// Price methods
const priceLibs = require('./app/libs/price');
const stringPriceToInt = priceLibs.stringPriceToInt;
const formatPrice = priceLibs.formatPrice;
const formatPriceDifference = priceLibs.formatPriceDifference;

// Scrape methods
const scraperLibs = require('./app/libs/scraper');
const scrape = scraperLibs.scrape;
const list = scraperLibs.list;


/**
 * Initialize the app
 * @return {void}
 */
const init = (async () => {

  // With CLI args, new price
  if (argv.title || argv.url || argv.selector) {

    const {title, url, selector, screenshot} = argv;

    // CLI arguments check
    if (typeof title === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `title` argument: --title="My Product"'.red);
      process.exit(1);
    }
    if (typeof url === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `url` argument: --url="https://mystore.com/my-product"'.red);
      process.exit(1);
    }
    if (typeof selector === 'undefined') {
      console.error('CLI Error: '.red.bold, 'You must include the `selector` argument: --selector=".price-selector"'.red);
      process.exit(1);
    }

    // Try the to scrap()
    try {
      scrape({
        title,
        url,
        selector,
        screenshot
      });
    } catch(e) {
      console.error('Cannot run scraper:'.red, e.red);
      process.exit(1);
    }

  // Just return current list
  } else if (argv.list) {

    list();

  } else {

    // Scrape stored prices
    console.log('re-scrape prices for latest...'.bold.magenta);

    // process.exit();
  }
})(Price);
