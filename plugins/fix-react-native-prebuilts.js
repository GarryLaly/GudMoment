const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Config plugin to pre-place React Native Core prebuilt tarballs
 * so pod install doesn't need to download them (fixes curl timeout issues).
 */
function fixReactNativePrebuilts(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const artifactsDir = path.join(
        projectRoot,
        "ios",
        "Pods",
        "ReactNativeCore-artifacts"
      );
      const prebuiltsDir = path.join(projectRoot, ".react-native-prebuilts");

      if (!fs.existsSync(prebuiltsDir)) {
        return config;
      }

      fs.mkdirSync(artifactsDir, { recursive: true });

      const files = [
        {
          src: "reactnative-core-debug.tar.gz",
          dest: "reactnative-core-0.83.2-debug.tar.gz",
        },
        {
          src: "reactnative-core-release.tar.gz",
          dest: "reactnative-core-0.83.2-release.tar.gz",
        },
      ];

      for (const { src, dest } of files) {
        const srcPath = path.join(prebuiltsDir, src);
        const destPath = path.join(artifactsDir, dest);
        if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`[fix-react-native-prebuilts] Copied ${src} -> ${dest}`);
        }
      }

      return config;
    },
  ]);
}

module.exports = fixReactNativePrebuilts;
