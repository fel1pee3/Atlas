const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const {
  getBundleModeMetroConfig,
} = require('react-native-worklets/bundleMode');

/**
 * Metro + Worklets Bundle Mode (workaround SDK 57 / Hermes + reanimated).
 * Em monorepo, worklets gera arquivos em node_modules/.worklets na RAIZ —
 * por isso watchFolders inclui o workspace root.
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];

module.exports = getBundleModeMetroConfig(config);
