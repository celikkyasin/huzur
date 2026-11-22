const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes("ogg")) {
  config.resolver.assetExts.push("ogg");
}
if (!config.resolver.assetExts.includes("mp3")) {
  config.resolver.assetExts.push("mp3");
}

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
