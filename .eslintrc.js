module.exports = {
  root: true,
  parserOptions: {
    project: ['tsconfig.json'],
    createDefaultProgram: true,
  },
  extends: [
    'plugin:@angular-eslint/recommended',
    // This is required if you use inline templates in Components
    'plugin:@angular-eslint/template/process-inline-templates',
  ],
  rules: {},
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        '@angular-eslint/no-input-rename': 'off',
        '@angular-eslint/no-output-rename': 'off',
      },
    },
  ],
};
