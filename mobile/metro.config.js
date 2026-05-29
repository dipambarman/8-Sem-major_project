const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─── Resolver ────────────────────────────────────────────────────────────────
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

// ─── Block-list: exclude OneDrive temp/lock files that cause Metro to choke ──
const { blockList } = require('metro-config');
config.resolver.blockList = [
  // OneDrive sync temp files
  /.*\.~lock\..*/,
  /.*~\$.*/,
  // dist & test artifacts
  /.*\/dist\/.*/,
  /.*\/test-entry\.js/,
];

// ─── Watcher: use polling on Windows to avoid EBUSY / file-lock errors ───────
config.watcher = {
  // 'node' watcher uses polling — avoids Windows FSEvents / OneDrive lock issues
  watchman: false,
  // Poll every 500 ms instead of relying on FS events
  additionalExts: ['ts', 'tsx'],
};

// ─── Server: increase timeout so slow OneDrive/network paths don't time out ──
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => middleware,
  rewriteRequestUrl: (url) => url,
};

module.exports = config;

