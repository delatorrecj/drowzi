const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const upstreamResolveRequest = config.resolver.resolveRequest;

const { assetExts, sourceExts } = config.resolver;

if (!assetExts.includes('tflite')) {
  assetExts.push('tflite');
}

// expo-sqlite web worker imports wa-sqlite.wasm; Metro must bundle it as an asset.
if (!assetExts.includes('wasm')) {
  assetExts.push('wasm');
}
config.resolver.sourceExts = sourceExts.filter((ext) => ext !== 'wasm');

// Some setups still resolve `.wasm` as source; force the on-disk file when it exists.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    typeof moduleName === 'string' &&
    moduleName.endsWith('.wasm') &&
    !path.isAbsolute(moduleName)
  ) {
    const candidate = path.normalize(
      path.join(path.dirname(context.originModulePath), moduleName),
    );
    if (fs.existsSync(candidate)) {
      return { type: 'sourceFile', filePath: candidate };
    }
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
