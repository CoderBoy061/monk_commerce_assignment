/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/mocks/"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["services/**/*.ts", "controllers/**/*.ts", "repositories/**/*.ts"],
  coverageDirectory: "coverage",
  verbose: true,
};
