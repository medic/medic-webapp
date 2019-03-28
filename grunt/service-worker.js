const swPrecache = require('sw-precache');
const path = require('path');

function registerServiceWorkerTasks(grunt) {
  grunt.registerMultiTask('generate-service-worker', function() {
    const done = this.async();
    const { staticDirectoryPath, rootUrl, scriptOutputPath } = this.data;
    writeServiceWorkerFile(staticDirectoryPath, rootUrl, scriptOutputPath)
      .then(done)
      .catch(error => {
        grunt.fail.warn(error);
        done();
      });
  });
};

// Use the swPrecache library to generate a service-worker script
function writeServiceWorkerFile(staticDirectoryPath, rootUrl, outputPath) {
  const config = {
    cacheId: 'cache',
    claimsClient: true,
    skipWaiting: true,
    directoryIndex: false,
    handleFetch: true,
    staticFileGlobs: [
      path.join(staticDirectoryPath, '{audio,css,img,js,xslt}', '*'),
      path.join(staticDirectoryPath, 'manifest.json'),

      // Fonts
      path.join(__dirname, 'fonts', 'fontawesome-webfont.woff2'),
      path.join(__dirname, 'fonts', 'enketo-icons-v2.woff'),
      path.join(__dirname, 'fonts', 'NotoSans-Bold.ttf'),
      path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf'),
    ],
    dynamicUrlToDependencies: {
      [rootUrl]: [path.join(staticDirectoryPath, 'templates', 'inbox.html')],
    },
    stripPrefixMulti: { [staticDirectoryPath]: '' },
    maximumFileSizeToCacheInBytes: 1048576 * 20,
    verbose: true,
  };

  return swPrecache.write(outputPath, config);
}

module.exports = registerServiceWorkerTasks;
