module.exports = {
  preset: 'jest-preset-angular',
  resetMocks: true,
  restoreMocks: true,
  globalSetup: 'jest-preset-angular/global-setup',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
