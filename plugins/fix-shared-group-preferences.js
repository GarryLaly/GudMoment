const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Config plugin to fix react-native-shared-group-preferences build.gradle
 * which uses deprecated jcenter() and an ancient Gradle plugin version.
 */
function fixSharedGroupPreferences(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const buildGradlePath = path.join(
        config.modRequest.projectRoot,
        "node_modules",
        "react-native-shared-group-preferences",
        "android",
        "build.gradle"
      );

      if (fs.existsSync(buildGradlePath)) {
        let content = fs.readFileSync(buildGradlePath, "utf-8");

        // Replace jcenter() with mavenCentral()
        content = content.replace(/jcenter\(\)/g, "mavenCentral()");

        // Remove the outdated buildscript block entirely - it's not needed
        // for library modules in modern Gradle
        content = content.replace(
          /buildscript\s*\{[\s\S]*?\n\}/,
          ""
        );

        fs.writeFileSync(buildGradlePath, content, "utf-8");
      }

      return config;
    },
  ]);
}

module.exports = fixSharedGroupPreferences;
