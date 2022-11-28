'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const fs = require('fs');
const funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'fingerprint': {
      extensions: [
        'js',
        'css',
        'map',
        'svg',
        'png',
        'jpg',
        'gif',
        'ttf',
        'woff',
        'woff2',
        'svg',
        'eot',
      ],
      replaceExtensions: ['html', 'css', 'js'],
    },
    'ember-bootstrap': {
      bootstrapVersion: 4,
      importBootstrapCSS: false,
      whitelist: [
        'bs-button',
        'bs-collapse',
        'bs-dropdown',
        'bs-modal',
        'bs-tab',
        'bs-tooltip',
      ],
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  fs.copyFileSync('app/manifest.json', 'public/manifest.json');

  const nodeAssets = [
    'abortcontroller-polyfill/dist/abortcontroller-polyfill-only.js',
    'spin.js/spin.css',
    'tippy.js/dist/tippy.css',
    'tippy.js/themes/light-border.css',
  ];
  nodeAssets.forEach(path => app.import(`node_modules/${path}`));

  const fontAwesomeFonts = funnel(
    './node_modules/@fortawesome/fontawesome-free/webfonts', {
      destDir: 'assets/fonts/fontawesome',
      include: ['fa-solid-*'],
    }
  );

  return merge([app.toTree(), fontAwesomeFonts]);
};
