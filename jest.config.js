module.exports = {
  preset: 'jest-preset-angular',
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
