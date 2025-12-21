module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s', '**/?(*.)+(spec|test).[jt]s'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    'server/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
