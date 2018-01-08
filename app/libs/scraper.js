const puppeteer = require('puppeteer');
const colors = require('colors');

// Pricing models
const Price = require('../models/price');

// Price methods
const priceLibs = require('../libs/price');
const stringPriceToInt = priceLibs.stringPriceToInt;
const formatPrice = priceLibs.formatPrice;
const formatPriceDifference = priceLibs.formatPriceDifference;
const formatPriceLog = priceLibs.formatPriceLog;

// Util methods
const utilLibs = require('../libs/utils');
const urlDomain = utilLibs.urlDomain;
const kebab = utilLibs.kebab;

/**
 * Scrape new price (via cli)
 * @param {object} priceData pricing object (title, url, selector)
 * @return {void}
 */
const checkPrices = async () => {
  console.log('checking prices...'.yellow);
};

/**
 * Scrape new price
 * @param {object} priceData pricing object (title, url, selector)
 * @return {void}
 */
const scrapePrices = async (priceData, screenshot = true) => {
    const { url, title, selector } = priceData;
    const duplicates = await Price.where({ url: url }).count();

    if (!duplicates) {
      const sourceName = urlDomain(url);
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
          // process.exit(1);
        }

        console.log('Price for'.green, `"${title}"`.green.bold, 'saved successfully!'.green, '\n');
      });
      // await page.waitForNavigation({ waitUntil: 'networkidle2' });

      await browser.close();

      console.log(`Complete, exiting...`.white);
      // process.exit();

    } else {
      console.warn('Price for'.yellow, `"${title}"`.yellow.bold, 'already exists, skipping!'.yellow, '\n');
    }
};

/**
 * Scrape new price (via cli)
 * @param {object} priceData pricing object (title, url, selector)
 * @return {object}
 */
const getPriceList = async () => {
  let prices;

  try {
    // mongoose query all prices
    prices = await Price.find({}, (err, prices) => {
      return prices;
    });
  } catch (err) {
    console.error('Could not retrieve prices:'.red.bold, err.red);
  }

  return await prices;
};

/**
 * Scrape new price (via cli)
 * @param {object} priceData pricing object (title, url, selector)
 * @return {array} priceListArray 
 */
const listPrices = async () => {
  const priceListArray = await getPriceList();

  for (var i = 0; i < priceListArray.length; i++) {
    console.info(colors.cyan(formatPriceLog(priceListArray[i].title, priceListArray[i].price.price, priceListArray[i].url)));
  }

  return priceListArray;
};

/** Exports */
exports.scrapePrices = scrapePrices;
exports.listPrices = listPrices;
exports.checkPrices = checkPrices;
