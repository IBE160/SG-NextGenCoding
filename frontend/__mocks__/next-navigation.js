// frontend/__mocks__/next-navigation.js
// Mock for next/navigation

const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  basePath: '',
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
  domainLocales: undefined,
  isReady: true,
  isPreview: false,
  asPath: '',
  pathname: '',
  query: {},
  route: '',
  // Add other properties if needed for specific tests
}))

const usePathname = jest.fn(() => '/mock-path')
const useSearchParams = jest.fn(() => new URLSearchParams(''))
const useServerInsertedHTML = jest.fn()
const useSelectedLayoutSegment = jest.fn()
const useSelectedLayoutSegments = jest.fn()
const useCurrentEditor = jest.fn()

module.exports = {
  useRouter,
  usePathname,
  useSearchParams,
  useServerInsertedHTML,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  useCurrentEditor,
}
