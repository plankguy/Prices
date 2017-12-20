/**
 *
 * @TODO:
 *  - Add historical pricing
 *  - CLI to add price data
 *  - CLI to check specific price by ?
 */
const puppeteer = require('puppeteer');
const colors = require('colors');
const argv = require('yargs').argv;

// Pricing models
const Price = require('./app/models/price');
// Price methods
const priceLibs = require('./app/libs/price');
const stringPriceToInt = priceLibs.stringPriceToInt;
const formatPrice = priceLibs.formatPrice;
const formatPriceDifference = priceLibs.formatPriceDifference;
// Util methods
const utilLibs = require('./app/libs/utils');
const kebab = utilLibs.kebab;

/**
 * Scrape new price (via cli)
 * @param {object} priceData pricing object (title, url, selector)
 * @return {void}
 */
const scrape = async (priceData, screenshot = true) => {
    const { url, title, selector } = priceData;
    const diplicates = await Price.where({ url: url }).count();

    if (!diplicates) {
      const sourceName = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/i)[1];
      const browser = await puppeteer.launch({
          // headless: false,
      });
      const page = await browser.newPage();

      // Log
      console.log('Scraping...'.rainbow.bold.inverse);

      // Navigation
      await page.goto(`${url}`); // , { waitUntil: ['load', 'domcontentloaded'] }
      console.info(`Opening url `.cyan.bold);
      console.info(`${url}`.cyan.underline, '...'.cyan);

      // // Base pricing
      // const basePriceStr = priceSources.sources[i].basePrice;
      // const basePriceInt = stringPriceToInt(basePriceStr.replace(/\s/mg, ''));
      // const basePriceFormatted = formatPrice(basePriceInt, '$');

      // Scraped pricing
      console.info(`Scraping price selector `.cyan.bold);
      console.info(`${selector}...`.cyan);

      const currentPriceElement = await page.$(selector);
      const currentPriceStr = await page.evaluate(
        (currentPriceElement) => currentPriceElement.textContent.replace(/\s/mg, ''),
        currentPriceElement
      );
      const currentPriceInt = stringPriceToInt(currentPriceStr);
      const currentPriceFormatted = formatPrice(currentPriceInt, '$');
      // // Price difference
      // const priceDiff = await formatPriceDifference(basePriceInt, currentPriceInt);

      //
      console.info('Getting price for'.cyan.bold, title.cyan.bold.italic, 'from'.cyan.bold, sourceName.cyan.bold.italic.underline);
      console.info(currentPriceFormatted.cyan
        // 'Previous price:'.green, basePriceFormatted.green,
        // '| Price '.green, priceDiff.green,
      );

      // Take a screenshot for fun
      if (screenshot) {
        await page.screenshot({
          path: `screens/price-${kebab(title)}--${sourceName}.png`,
          clip: {
            x:      0,
            y:      0,
            width:  1200,
            height: 1200,
          },
        });
        console.log('Taking screenshot...'.cyan.bold, '\n');
      }

      // @TODO add error handling

      /** @type {Price} */
      const price = new Price({
        title:    title,
        url:      url,
        selector: selector,
        price:    {
          date:  new Date(),
          price: currentPriceInt,
        },
        prices: [
          {
            date:  new Date(),
            price: currentPriceInt,
          },
        ],
      });

      // Save new price
      await price.save((error) => {
        if (error) {
          console.error('Error saving price to database:'.red.bold, error.red, '\n');
          process.exit(1);
        }

        console.log('Price for'.green, `"${title}"`.green.bold, 'saved successfully!'.green, '\n');
      });
      // await page.waitForNavigation({ waitUntil: 'networkidle2' });

      await browser.close();

      console.log(`Complete, exiting...`.white);
      process.exit();

    } else {
      console.warn('Price for'.yellow, `"${title}"`.yellow.bold, 'already exists, skipping!'.yellow, '\n');
      process.exit();
    }
};


/**
 * Initialize the app
 * @return {void}
 */
const init = (function() {

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

    console.log('list all prices...'.bold.magenta);

    Price.find({}, (err, prices) => {
      if (err) {
        console.error('Could not retrieve prices:'.red.bold, err.red);
      };
    });

    process.exit();

  } else {

    // Scrape stored prices
    console.log('re-scrape prices for latest...'.bold.magenta);

    process.exit();
  }
}(Price));
