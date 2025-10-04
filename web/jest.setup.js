require("@testing-library/jest-dom")

// Mock Gatsby
global.___loader = {
  enqueue: jest.fn(),
}

global.___navigate = jest.fn()
