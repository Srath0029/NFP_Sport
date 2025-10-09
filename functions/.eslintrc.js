/* eslint-env node */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "script", // CommonJS files (require/exports)
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    // Allow empty catch (or we log; either way silence the rule)
    "no-empty": ["error", { "allowEmptyCatch": true }],
  },
  ignorePatterns: [
    "lib/**",
    "node_modules/**",
  ],
};
