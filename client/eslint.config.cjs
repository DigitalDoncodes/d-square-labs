const js = require('@eslint/js');
const globals = require('globals');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      // We don't have the recommended configs from react plugin easily in flat config?
      // Let's just use the eslint:recommended and then add some basic rules.
    },
  },
];
