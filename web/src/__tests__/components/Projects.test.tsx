import React from "react"
import { render, screen } from "@testing-library/react"
import Projects from "../../components/homepage/Projects"

// Mock the MDX component
jest.mock("../../content/sections/projects.mdx", () => {
  return function ProjectsMock() {
    return <div data-testid="projects-content">Projects Content</div>
  }
})

// Shared manual mocks live next to each module, in its __mocks__ directory
jest.mock("../../components/elements/Divider")
jest.mock("../../components/elements/Content")
jest.mock("../../components/elements/Inner")
jest.mock("../../components/homepage/Svg")
jest.mock("../../styles/animations")

describe("Projects Component", () => {
  it("renders without crashing", () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByTestId("projects-content")).toBeInTheDocument()
  })

  it("renders the section heading", () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByRole("heading", { level: 2, name: "Projects" })).toBeInTheDocument()
  })

  it("applies the projects preset", () => {
    const { container } = render(<Projects offset={1} factor={2} />)
    const section = container.querySelector(".section")
    expect(section).toHaveAttribute("data-icon-preset", "projects")
  })

  it("renders gradient divider", () => {
    render(<Projects offset={1} factor={2} />)
    const dividers = screen.getAllByTestId("divider")
    expect(dividers.length).toBeGreaterThan(0)
  })

  it("renders icon canvas with animations", () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByTestId("updown")).toBeInTheDocument()
    expect(screen.getByTestId("updownwide")).toBeInTheDocument()
  })

  it("renders background icons", () => {
    render(<Projects offset={1} factor={2} />)
    const icons = screen.getAllByTestId("icon")
    expect(icons.length).toBeGreaterThan(0)
  })

  it("renders content with proper layering", () => {
    render(<Projects offset={1} factor={2} />)
    const content = screen.getByTestId("content")
    expect(content).toHaveClass("content")
  })
})
