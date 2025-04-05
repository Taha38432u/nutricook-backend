module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        console: "readonly", // ✅ Fixes "console is not defined" error
      },
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
      node: require("eslint-plugin-node"),
      import: require("eslint-plugin-import"),
    },
    rules: {
      // "prettier/prettier": "error",
      "no-console": "warn",
      "node/no-unsupported-features/es-syntax": "off",
      "import/no-unresolved": "error",
      "no-undef": "error", // ✅ Ensure all variables & functions are defined
      "no-unused-vars": "warn",

      // ⚫ Import Rules (Prevent Import Issues)
      "import/no-unresolved": "error", // Ensure imports point to correct files
      // "import/no-extraneous-dependencies": ["warn", { packageDir: "./" }], // ✅ Warn if a package is not in package.json
      // "import/no-missing-require": "error", // ✅ Ensure require() statements point to installed modules
      "import/newline-after-import": "warn", // Enforce newline after imports
      "import/no-duplicates": "error", // Prevent duplicate imports
    },
  },
];
