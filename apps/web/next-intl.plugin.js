/**
 * next-intl plugin configuration
 */

const createNextIntlPlugin = require('next-intl/plugin');

module.exports = createNextIntlPlugin('./src/i18n.ts');
