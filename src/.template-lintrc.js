'use strict';

const {
  DEFAULT_CONFIG,
} = require('ember-template-lint/lib/rules/no-bare-strings');

module.exports = {
  extends: 'recommended',
  rules: {
    'no-bare-strings': [...DEFAULT_CONFIG.allowlist, '"', '\'', '-'],
  },
};
