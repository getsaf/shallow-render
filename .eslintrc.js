module.exports = {
  root: true,
  parserOptions: {
    project: ['tsconfig.json'],
    createDefaultProgram: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@angular-eslint/recommended',
    // This is required if you use inline templates in Components
    'plugin:@angular-eslint/template/process-inline-templates',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
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
