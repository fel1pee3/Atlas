module.exports = function (api) {
  api.cache(true);
  return {
    // Preset Expo já inclui o plugin de worklets (SDK 50+).
    // Sem bundleMode — compatível com EAS preview/production (eager bundle).
    presets: ['babel-preset-expo'],
  };
};
