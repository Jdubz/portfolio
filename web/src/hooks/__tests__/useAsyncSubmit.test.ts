/**
 * Tests for useAsyncSubmit Hook
 *
 * High-impact tests for form submission state management
 */

import { renderHook, act, waitFor } from "@testing-library/react"
import { useAsyncSubmit } from "../useAsyncSubmit"

// Mock the logger to avoid console spam during tests
jest.mock("../../utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))

describe("useAsyncSubmit", () => {
  describe("Initial State", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useAsyncSubmit())

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.handleSubmit).toBe("function")
      expect(typeof result.current.clearError).toBe("function")
      expect(typeof result.current.setError).toBe("function")
    })
  })

  describe("Successful Submission", () => {
    it("should handle successful async submission", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockData = { id: 1, name: "Test" }
      const mockSubmitFn = jest.fn().mockResolvedValue(mockData)

      let returnValue: typeof mockData | null = null

      await act(async () => {
        returnValue = await result.current.handleSubmit(mockSubmitFn)
      })

      expect(mockSubmitFn).toHaveBeenCalledTimes(1)
      expect(returnValue).toEqual(mockData)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should set isSubmitting to true during submission", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      let submittingStateValues: boolean[] = []

      const mockSubmitFn = jest.fn().mockImplementation(async () => {
        // Capture the isSubmitting state during submission
        await new Promise((resolve) => setTimeout(resolve, 10))
        submittingStateValues.push(result.current.isSubmitting)
        return { success: true }
      })

      let submitPromise: Promise<any>

      act(() => {
        submitPromise = result.current.handleSubmit(mockSubmitFn)
        submittingStateValues.push(result.current.isSubmitting)
      })

      await act(async () => {
        await submitPromise
      })

      expect(submittingStateValues).toContain(true)
      expect(result.current.isSubmitting).toBe(false)
    })

    it("should call onSuccess callback on successful submission", async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useAsyncSubmit({ onSuccess }))
      const mockSubmitFn = jest.fn().mockResolvedValue({ success: true })

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it("should clear previous errors on successful submission", async () => {
      const { result } = renderHook(() => useAsyncSubmit())

      // Set an error first
      act(() => {
        result.current.setError("Previous error")
      })
      expect(result.current.error).toBe("Previous error")

      // Submit successfully
      const mockSubmitFn = jest.fn().mockResolvedValue({ success: true })
      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe("Failed Submission", () => {
    it("should handle submission failure with Error object", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const errorMessage = "Network error occurred"
      const mockSubmitFn = jest.fn().mockRejectedValue(new Error(errorMessage))

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should handle submission failure with non-Error rejection", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockSubmitFn = jest.fn().mockRejectedValue("String error")

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(result.current.error).toBe("Unknown error")
    })

    it("should return null on submission failure", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockSubmitFn = jest.fn().mockRejectedValue(new Error("Failed"))

      let returnValue

      await act(async () => {
        returnValue = await result.current.handleSubmit(mockSubmitFn)
      })

      expect(returnValue).toBeNull()
    })

    it("should call onError callback on submission failure", async () => {
      const onError = jest.fn()
      const { result } = renderHook(() => useAsyncSubmit({ onError }))
      const error = new Error("Submission failed")
      const mockSubmitFn = jest.fn().mockRejectedValue(error)

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(error)
    })

    it("should not call onSuccess callback on submission failure", async () => {
      const onSuccess = jest.fn()
      const { result } = renderHook(() => useAsyncSubmit({ onSuccess }))
      const mockSubmitFn = jest.fn().mockRejectedValue(new Error("Failed"))

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe("Manual Error Management", () => {
    it("should allow manually setting an error", () => {
      const { result } = renderHook(() => useAsyncSubmit())

      act(() => {
        result.current.setError("Manual error message")
      })

      expect(result.current.error).toBe("Manual error message")
    })

    it("should allow clearing an error", () => {
      const { result } = renderHook(() => useAsyncSubmit())

      // Set error
      act(() => {
        result.current.setError("Error message")
      })
      expect(result.current.error).toBe("Error message")

      // Clear error
      act(() => {
        result.current.clearError()
      })
      expect(result.current.error).toBeNull()
    })
  })

  describe("Options and Context", () => {
    it("should accept component and action options for logging", async () => {
      const { result } = renderHook(() =>
        useAsyncSubmit({
          component: "ContactForm",
          action: "sendMessage",
        })
      )

      const mockSubmitFn = jest.fn().mockResolvedValue({ success: true })

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe("Multiple Submissions", () => {
    it("should handle multiple sequential submissions", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockSubmitFn1 = jest.fn().mockResolvedValue({ id: 1 })
      const mockSubmitFn2 = jest.fn().mockResolvedValue({ id: 2 })

      // First submission
      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn1)
      })
      expect(mockSubmitFn1).toHaveBeenCalledTimes(1)
      expect(result.current.isSubmitting).toBe(false)

      // Second submission
      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn2)
      })
      expect(mockSubmitFn2).toHaveBeenCalledTimes(1)
      expect(result.current.isSubmitting).toBe(false)
    })

    it("should handle submission after previous failure", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockFailingFn = jest.fn().mockRejectedValue(new Error("First failed"))
      const mockSuccessFn = jest.fn().mockResolvedValue({ success: true })

      // First submission fails
      await act(async () => {
        await result.current.handleSubmit(mockFailingFn)
      })
      expect(result.current.error).toBe("First failed")

      // Second submission succeeds
      await act(async () => {
        await result.current.handleSubmit(mockSuccessFn)
      })
      expect(result.current.error).toBeNull()
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe("Edge Cases", () => {
    it("should handle submission that returns undefined", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const mockSubmitFn = jest.fn().mockResolvedValue(undefined)

      let returnValue: unknown

      await act(async () => {
        returnValue = await result.current.handleSubmit(mockSubmitFn)
      })

      expect(returnValue).toBeUndefined()
      expect(result.current.error).toBeNull()
    })

    it("should handle Error with empty message property", async () => {
      const { result } = renderHook(() => useAsyncSubmit())
      const errorWithEmptyMessage = new Error("")
      const mockSubmitFn = jest.fn().mockRejectedValue(errorWithEmptyMessage)

      await act(async () => {
        await result.current.handleSubmit(mockSubmitFn)
      })

      expect(result.current.error).toBe("An error occurred")
    })
  })
})
