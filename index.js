/**
 *
 * @TODO:
 *  - Add historical pricing
 *  - CLI to add price data
 *  - CLI to check specific price by ?
 */
const colors = require('colors');
const argv = require('yargs').argv;

// Scrape methods
const scraperLibs = require('./app/libs/scraper');
const scrape = scraperLibs.scrape;
const list = scraperLibs.list;
const check = scraperLibs.check;

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

    try {
      list();
    } catch(e) {
      console.error('Cannot get price list:'.red, e.red);
      process.exit(1);
    }

  } else {

    // Scrape stored prices
    // run scraper:
    // - check if element exists
    //   - if yes, update entry price & push current price to historical Pricing
    //   - if no, add new entry
    // - then, return price differences
    //   - compare latest price w/ previous
    //   - show current, previous, difference ($ and %)
    try {
      check();
    } catch(e) {
      console.error('Cannot check latest prices:'.red, e.red);
      process.exit(1);
    }

    // process.exit();
  }
})();
