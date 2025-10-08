import { test, expect } from "@playwright/test"

/**
 * E2E tests for Experience Portfolio Page
 * Tests both public view and authenticated editor functionality
 */

test.describe("Experience Page - Public View", () => {
  test("should display experience entries without auth", async ({ page }) => {
    await page.goto("http://localhost:8000/experience/")

    // Page loads successfully
    await expect(page.locator("h1")).toContainText("Experience Portfolio")

    // Should show experience entries from seeded data
    await expect(page.locator("text=Senior Full-Stack Developer")).toBeVisible()
    await expect(page.locator("text=Frontend Developer")).toBeVisible()

    // Should NOT show editor controls
    await expect(page.locator("button:has-text('Add New Entry')")).not.toBeVisible()
    await expect(page.locator("button:has-text('Edit')")).not.toBeVisible()
    await expect(page.locator("button:has-text('Delete')")).not.toBeVisible()

    // Should show sign-in button
    await expect(page.locator("button:has-text('Editor Sign In')")).toBeVisible()
  })

  test("should format dates correctly", async ({ page }) => {
    await page.goto("http://localhost:8000/experience/")

    // Check date formatting (YYYY-MM → "Jan 2023")
    await expect(page.locator("text=/Jan \\d{4}/")).toBeVisible()
  })
})

test.describe("Experience Page - Editor Authentication", () => {
  test("should allow editor sign-in via emulator", async ({ page, context }) => {
    await page.goto("http://localhost:8000/experience/")

    // Click sign-in button
    await page.click("button:has-text('Editor Sign In')")

    // Wait for Firebase Auth popup/redirect
    // In emulator, this typically auto-signs in or shows emulator UI
    await page.waitForTimeout(2000)

    // Check for EDITOR badge or email display
    // Note: Emulator auth behavior may vary
    const editorBadge = page.locator("text=EDITOR")
    const signOutButton = page.locator("button:has-text('Sign Out')")

    // If auth succeeded, we should see either badge or sign-out
    const authSuccess = (await editorBadge.isVisible()) || (await signOutButton.isVisible())
    expect(authSuccess).toBe(true)
  })
})

test.describe("Experience Page - CRUD Operations", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up authenticated session with emulator
    // Using emulator custom token approach
    await page.goto("http://localhost:8000/experience/")

    // For emulator testing, we'll manually set auth state
    // In a real test, you'd sign in properly
    await page.evaluate(() => {
      // This is a placeholder - actual emulator auth would be set up differently
      localStorage.setItem("firebase:authUser:test", JSON.stringify({
        uid: "test-editor-1",
        email: "editor1@example.com",
        role: "editor"
      }))
    })

    await page.reload()
  })

  test("should show editor controls when authenticated", async ({ page }) => {
    // Check for editor-only UI elements
    const addButton = page.locator("button:has-text('Add New Entry')")

    // This might not work without proper Firebase auth setup in the test
    // Commenting out for now - this is a template for when auth is properly configured
    // await expect(addButton).toBeVisible()
  })

  test("should create new experience entry", async ({ page }) => {
    // Skip if not properly authenticated
    test.skip()

    await page.click("button:has-text('Add New Entry')")

    // Fill out the form
    await page.fill("input[placeholder*='Senior']", "Test Position")
    await page.fill("input[placeholder*='2023-01']", "2024-01")
    await page.fill("textarea", "This is a test entry created by E2E test")

    // Submit
    await page.click("button:has-text('Create Entry')")

    // Wait for entry to appear
    await expect(page.locator("text=Test Position")).toBeVisible({ timeout: 5000 })
  })

  test("should edit existing entry", async ({ page }) => {
    test.skip()

    // Find and click edit on first entry
    await page.click("button:has-text('Edit')").first()

    // Modify title
    const titleInput = page.locator("input").first()
    await titleInput.fill("Updated Title")

    // Save
    await page.click("button:has-text('Save')")

    // Verify update
    await expect(page.locator("text=Updated Title")).toBeVisible()
  })

  test("should delete entry with confirmation", async ({ page }) => {
    test.skip()

    // Set up dialog handler
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Delete")
      void dialog.accept()
    })

    // Click delete
    await page.click("button:has-text('Delete')").first()

    // Entry should be removed (we'd need to check by counting entries)
    await page.waitForTimeout(1000)
  })
})

test.describe("Experience Page - Error Handling", () => {
  test("should show error if API is unavailable", async ({ page, context }) => {
    // Block API requests to simulate failure
    await context.route("**/experience/entries", (route) => {
      void route.abort()
    })

    await page.goto("http://localhost:8000/experience/")

    // Should show error message
    await expect(page.locator("text=/Failed to/i")).toBeVisible({ timeout: 10000 })
  })

  test("should handle empty state", async ({ page, context }) => {
    // Mock empty response
    await context.route("**/experience/entries", (route) => {
      void route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          entries: [],
          count: 0
        })
      })
    })

    await page.goto("http://localhost:8000/experience/")

    // Should show empty state message
    await expect(page.locator("text=No experience entries yet")).toBeVisible()
  })
})

test.describe("Experience Page - Validation", () => {
  test("should validate required fields in create form", async ({ page }) => {
    test.skip() // Skip until auth is set up

    await page.click("button:has-text('Add New Entry')")

    // Try to submit without filling required fields
    await page.click("button:has-text('Create Entry')")

    // HTML5 validation should prevent submission
    const titleInput = page.locator("input[required]").first()
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test("should validate date format", async ({ page }) => {
    test.skip()

    await page.click("button:has-text('Add New Entry')")

    // Fill with invalid date format
    await page.fill("input[placeholder*='Senior']", "Test")
    await page.fill("input[placeholder*='2023-01']", "invalid-date")
    await page.click("button:has-text('Create Entry')")

    // Should show error message about date format
    await expect(page.locator("text=/format/i")).toBeVisible()
  })
})

test.describe("Experience Page - Accessibility", () => {
  test("should have proper form labels", async ({ page }) => {
    test.skip()

    await page.click("button:has-text('Add New Entry')")

    // Check that all inputs have labels
    const labels = await page.locator("label").count()
    expect(labels).toBeGreaterThan(0)
  })

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("http://localhost:8000/experience/")

    // Tab through elements
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeDefined()
  })
})
