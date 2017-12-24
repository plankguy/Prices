/**
 * Kebabify a string
 * @param  {string}
 * @return {string}
 */
const kebab = (string) => string.replace(/[\s,_.$!@#$%^&*()=+;:"'/\\<>~`]+/g, '-').toLowerCase();

/**
 * Return domain from URL
 * @param  {string}
 * @return {string}
 */
const urlDomain = (url) => url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/i)[1];

/** Exports */
exports.kebab = kebab;
exports.urlDomain = urlDomain;
