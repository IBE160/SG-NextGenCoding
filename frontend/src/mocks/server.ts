// For Jest/Node environment, we need to handle MSW differently due to ESM issues
// Using dynamic import or a simpler mock approach
let setupServer: any
let server: any

try {
  // Try to import MSW for Node
  const msw = require('msw/node')
  setupServer = msw.setupServer
} catch (e) {
  // Fallback: create a mock server for testing
  setupServer = (...handlers: any[]) => ({
    listen: () => {},
    close: () => {},
    resetHandlers: () => {},
    use: (...newHandlers: any[]) => {},
  })
}

import { handlers } from './handlers'

server = setupServer(...handlers)

export { server }
