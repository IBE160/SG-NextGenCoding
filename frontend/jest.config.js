const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  transformIgnorePatterns: [
      '/node_modules/(?!(uuid|until-async|@mswjs|msw|react-markdown|remark-.+|rehype-.+|unified|unist-.+|bail|trough|vfile.*|react-copy-to-clipboard))/'
    ],

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)