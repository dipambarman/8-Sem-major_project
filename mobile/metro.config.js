const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro configuration for better compatibility
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

module.exports = config;
