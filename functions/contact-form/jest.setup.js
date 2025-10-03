// Jest setup file - runs before each test file
process.env.NODE_ENV = "test"

// Mock nodemailer's createTestAccount to avoid Node.js environment issues
jest.mock("nodemailer", () => ({
  createTestAccount: jest
    .fn()
    .mockRejectedValue(new Error("Mock nodemailer - not available in test environment")),
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
  }),
}))

// Mock Google Cloud Secret Manager to avoid authentication issues in tests
jest.mock("@google-cloud/secret-manager", () => ({
  SecretManagerServiceClient: jest.fn().mockImplementation(() => ({
    accessSecretVersion: jest
      .fn()
      .mockRejectedValue(
        new Error("Mock secret manager - not available in test environment")
      ),
  })),
}))