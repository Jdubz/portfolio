import { test, expect } from "@playwright/test"

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact")
  })

  test("should display contact form", async ({ page }) => {
    await expect(page.locator("form[aria-label='Contact form']")).toBeVisible()
    await expect(page.locator("input#name")).toBeVisible()
    await expect(page.locator("input#email")).toBeVisible()
    await expect(page.locator("textarea#message")).toBeVisible()
    await expect(page.locator("button[type='submit']")).toBeVisible()
  })

  test("should show validation errors for empty fields", async ({ page }) => {
    // Try to submit empty form
    await page.locator("button[type='submit']").click()

    // Check for validation errors
    await expect(page.locator("#name-error")).toContainText("Name is required")
    await expect(page.locator("#email-error")).toContainText("Email is required")
    await expect(page.locator("#message-error")).toContainText("Message is required")
  })

  test("should show validation error for invalid email", async ({ page }) => {
    // Fill in name and message
    await page.locator("input#name").fill("Test User")
    await page.locator("textarea#message").fill("Test message")

    // Fill in invalid email
    await page.locator("input#email").fill("invalid-email")

    // Submit form
    await page.locator("button[type='submit']").click()

    // Check for email validation error
    await expect(page.locator("#email-error")).toContainText("Email is invalid")
  })

  test("should display loading state when submitting", async ({ page }) => {
    // Fill in valid form data
    await page.locator("input#name").fill("Test User")
    await page.locator("input#email").fill("test@example.com")
    await page.locator("textarea#message").fill("This is a test message from E2E tests")

    // Intercept the network request to delay response
    await page.route("**/contact-form-staging", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Success" }),
      })
    })

    // Submit form
    await page.locator("button[type='submit']").click()

    // Check for loading state
    await expect(page.locator("button[type='submit']")).toContainText("Sending...")
    await expect(page.locator("button[type='submit']")).toBeDisabled()
  })

  test("should show success message on successful submission", async ({ page }) => {
    // Fill in valid form data
    await page.locator("input#name").fill("Test User")
    await page.locator("input#email").fill("test@example.com")
    await page.locator("textarea#message").fill("This is a test message from E2E tests")

    // Mock successful response
    await page.route("**/contact-form-staging", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Success" }),
      })
    })

    // Submit form
    await page.locator("button[type='submit']").click()

    // Wait for success message
    await expect(page.getByText("Thank you! Your message has been sent successfully.")).toBeVisible({
      timeout: 5000,
    })

    // Form should be cleared
    await expect(page.locator("input#name")).toHaveValue("")
    await expect(page.locator("input#email")).toHaveValue("")
    await expect(page.locator("textarea#message")).toHaveValue("")
  })

  test("should show error message on network failure", async ({ page }) => {
    // Fill in valid form data
    await page.locator("input#name").fill("Test User")
    await page.locator("input#email").fill("test@example.com")
    await page.locator("textarea#message").fill("This is a test message from E2E tests")

    // Mock network error
    await page.route("**/contact-form-staging", async (route) => {
      await route.abort("failed")
    })

    // Submit form
    await page.locator("button[type='submit']").click()

    // Wait for error message
    await expect(
      page.getByText(/Network error: Unable to connect|couldn't send your message/i)
    ).toBeVisible({
      timeout: 5000,
    })
  })

  test("should show error message on server error", async ({ page }) => {
    // Fill in valid form data
    await page.locator("input#name").fill("Test User")
    await page.locator("input#email").fill("test@example.com")
    await page.locator("textarea#message").fill("This is a test message from E2E tests")

    // Mock server error
    await page.route("**/contact-form-staging", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Internal server error",
          errorCode: "INTERNAL_ERROR",
        }),
      })
    })

    // Submit form
    await page.locator("button[type='submit']").click()

    // Wait for error message
    await expect(page.getByText(/Internal server error|couldn't send your message/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test("should handle request timeout", async ({ page }) => {
    // Fill in valid form data
    await page.locator("input#name").fill("Test User")
    await page.locator("input#email").fill("test@example.com")
    await page.locator("textarea#message").fill("This is a test message from E2E tests")

    // Mock timeout (delay longer than 30 seconds won't work in test, so we'll use abort)
    await page.route("**/contact-form-staging", async (route) => {
      // Simulate timeout by delaying then aborting
      await new Promise((resolve) => setTimeout(resolve, 100))
      await route.abort("timedout")
    })

    // Submit form
    await page.locator("button[type='submit']").click()

    // Wait for timeout error message
    await expect(page.getByText(/timed out|Network error/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test("should be accessible", async ({ page }) => {
    // Check form has proper labels
    await expect(page.locator("label[for='name']")).toBeVisible()
    await expect(page.locator("label[for='email']")).toBeVisible()
    await expect(page.locator("label[for='message']")).toBeVisible()

    // Check inputs have proper aria attributes when showing errors
    await page.locator("button[type='submit']").click()

    await expect(page.locator("input#name")).toHaveAttribute("aria-invalid", "true")
    await expect(page.locator("input#email")).toHaveAttribute("aria-invalid", "true")
    await expect(page.locator("textarea#message")).toHaveAttribute("aria-invalid", "true")

    await expect(page.locator("input#name")).toHaveAttribute("aria-describedby", "name-error")
    await expect(page.locator("input#email")).toHaveAttribute("aria-describedby", "email-error")
    await expect(page.locator("textarea#message")).toHaveAttribute("aria-describedby", "message-error")
  })
})
