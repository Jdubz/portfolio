import { logger, serializeError } from "../logger"

describe("logger", () => {
  it("keeps the message and stack of logged errors", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined)

    logger.error("Failed to send email", { requestId: "abc", error: new Error("mailgun 401") })

    const entry = JSON.parse(spy.mock.calls[0][0] as string)
    expect(entry).toMatchObject({
      severity: "ERROR",
      message: "Failed to send email",
      requestId: "abc",
      error: { name: "Error", message: "mailgun 401" },
    })
    expect(entry.error.stack).toContain("mailgun 401")

    spy.mockRestore()
  })

  it("keeps extra fields that API clients attach to errors", () => {
    const error = Object.assign(new Error("Unauthorized"), { status: 401 })

    expect(serializeError(error)).toMatchObject({ message: "Unauthorized", status: 401 })
  })
})
