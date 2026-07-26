const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro monorepo config.
 * Bundle Mode (worklets) foi desligado: no EAS eager-bundle ele falha com
 * "Failed to get the SHA-1 for .../.worklets/*.js" em install limpo.
 * Reanimated/worklets seguem via babel-preset-expo (sem bundleMode).
 */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
