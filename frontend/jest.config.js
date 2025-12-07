module.exports = {
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'until-async': '<rootDir>/src/mocks/until-async.js',
    'next/navigation': '<rootDir>/__mocks__/next-navigation.js',
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|react-markdown|vfile|vfile-message|unist-.*|unified|bail|is-plain-obj|trough|remark-.*|mdast-util-.*|micromark.*|decode-named-character-reference|character-entities)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}
