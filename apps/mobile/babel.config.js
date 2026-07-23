module.exports = function (api) {
  api.cache(true);
  return {
    // Desliga o auto-plugin do preset e usa Bundle Mode (workaround SDK 57 /
    // Hermes + reanimated — ver changelog Expo SDK 57 "Known regressions").
    presets: [['babel-preset-expo', { worklets: false, reanimated: false }]],
    plugins: [['react-native-worklets/plugin', { bundleMode: true }]],
  };
};
