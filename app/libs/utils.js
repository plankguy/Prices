/**
 * Kebabify a string
 * @param  {string}
 * @return {string}
 */
const kebab = (string) => string.replace(/[\s,_.$!@#$%^&*()=+;:"'/\\<>~`]+/g, '-').toLowerCase();

// Export
exports.kebab = kebab;
