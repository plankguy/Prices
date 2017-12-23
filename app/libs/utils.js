/**
 * Kebabify a string
 * @param  {string}
 * @return {string}
 */
const kebab = (string) => string.replace(/[\s,_.$!@#$%^&*()=+;:"'/\\<>~`]+/g, '-').toLowerCase();

// Exports
exports.kebab = kebab;
