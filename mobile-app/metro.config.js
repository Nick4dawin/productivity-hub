const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': './src',
    },
  },
  transformer: {
    // Enable minification in production
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      warnings: false,
    },
  },
  serializer: {
    // Optimize bundle size
    createModuleIdFactory: () => (path) => {
      // Use shorter module IDs in production
      return require('crypto')
        .createHash('md5')
        .update(path)
        .digest('hex')
        .substr(0, 8);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);