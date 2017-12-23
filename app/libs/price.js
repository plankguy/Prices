const accounting = require('accounting');

/**
 * Convert the price string to an integer for math
 * @param  {string}
 * @param  {int}
 * @param  {int}
 */
const stringPriceToInt = (price, decimals = 2) => accounting.toFixed(price, decimals);

/**
 * Format the price all pretty-like
 * @param  {int|string}
 * @param  {string}
 * @param  {string}
 */
const formatPrice = (price, symbol = '$') => accounting.formatMoney(price, symbol);

/**
 * Return the difference of the price
 * @param  {int}
 * @param  {int}
 * @param  {string}
 * @return {string}
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

// Exports
exports.stringPriceToInt = stringPriceToInt;
exports.formatPrice = formatPrice;
exports.formatPriceDifference = formatPriceDifference;
