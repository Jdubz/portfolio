import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ProjectPlan, { planAsText, planGroups } from "../../components/ledHelp/ProjectPlan"

jest.mock("gatsby", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
}))

describe("ProjectPlan", () => {
  it("shows every question group", () => {
    render(<ProjectPlan />)
    planGroups.forEach((group) => {
      expect(screen.getByRole("heading", { name: new RegExp(group.title) })).toBeInTheDocument()
    })
  })

  it("offers the plan as a text download", () => {
    render(<ProjectPlan />)
    const link = screen.getByRole("link", { name: "Download .txt" })
    expect(link).toHaveAttribute("download", "led-project-plan.txt")
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain("LED WORKSHOP PROJECT PLAN")
  })

  it("copies the plan and says so", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<ProjectPlan />)
    fireEvent.click(screen.getByRole("button", { name: "Copy plan as text" }))

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied"))
    expect(writeText).toHaveBeenCalledWith(planAsText())
  })

  it("points to the download when copying fails", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) } })

    render(<ProjectPlan />)
    fireEvent.click(screen.getByRole("button", { name: "Copy plan as text" }))

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Use the download instead"))
  })
})

describe("planAsText", () => {
  it("numbers every question with a place for the answer", () => {
    const text = planAsText()
    const questionCount = planGroups.reduce((total, group) => total + group.questions.length, 0)
    expect(text.match(/Answer:/g)).toHaveLength(questionCount)
    expect(text).toContain("1.1 What are you making")
    expect(text).toContain(`${planGroups.length}. SHOPPING LIST AND BUDGET`)
  })
})
