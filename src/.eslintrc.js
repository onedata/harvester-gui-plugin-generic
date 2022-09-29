/* eslint-env node */

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
      ],
    },
  },
  plugins: [
    'ember',
    'node',
    'promise',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  rules: {
    'no-console': 0,
    'dot-location': [
      1,
      'property',
    ],
    'eol-last': 1,
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],
    'quotes': [
      1,
      'single',
    ],
    'quote-props': [
      1,
      'consistent-as-needed',
    ],
    'no-warning-comments': [
      1,
      {
        terms: ['fixme'],
      },
    ],
    'semi': 2,
    'valid-jsdoc': [
      1,
      {
        requireParamDescription: false,
        requireReturnDescription: false,
        requireReturn: false,
      },
    ],
    'prefer-const': [
      1,
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
      },
    ],
    'no-var': 1,
    'one-var': [
      1,
      'never',
    ],
    'max-len': [
      1,
      {
        code: 90,
        tabWidth: 2,
        ignoreStrings: false,
        ignoreComments: true,
        ignoreTrailingComments: false,
        ignoreUrls: true,
        ignoreTemplateLiterals: false,
        ignoreRegExpLiterals: true,
        ignorePattern: '^import|.*[\'"`]\\)?,?;?$',
      },
    ],
    'promise/always-return': 'off', // default: error
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'off', // default: error
    'promise/no-native': 'error',
    'promise/no-nesting': 'off', // default: warn
    'promise/no-promise-in-callback': 'error',
    'promise/no-callback-in-promise': 'off', // default: warn
    'promise/avoid-new': 'off', // default: warn
    'promise/no-return-in-finally': 'error',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
        'node/no-extraneous-require': 'off',

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off',
      }),
    },
  ],
};
