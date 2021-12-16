export default {
	preset: 'ts-jest',
	clearMocks: true,
	restoreMocks: true,
	testEnvironment: 'node',
	collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	coverageReporters: ['text', 'lcov'],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	watchPathIgnorePatterns: ['node_modules'],
	transformIgnorePatterns: ['node_modules'],
};
