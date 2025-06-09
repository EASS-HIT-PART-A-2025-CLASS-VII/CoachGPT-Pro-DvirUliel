// jest.config.js - Clean Working Configuration
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/tests/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testTimeout: 30000,
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    maxWorkers: 1,
    
    // TypeScript configuration
    transform: {
      '^.+\\.ts$': ['ts-jest', {
        tsconfig: {
          target: 'ES2020',
          module: 'commonjs',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          moduleResolution: 'node',
          allowJs: true,
          strict: false,
          noImplicitAny: false
        }
      }]
    },
    
    // Module resolution
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    
    // Environment variables
    setupFiles: ['<rootDir>/tests/env-setup.js'],
    
    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,
    
    // Error handling
    errorOnDeprecated: false,
    detectOpenHandles: true,
    forceExit: true,
    
    // Globals
    globals: {
      'ts-jest': {
        useESM: false,
        isolatedModules: true
      }
    }
  };