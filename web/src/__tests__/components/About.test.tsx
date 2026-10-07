import React from "react"
import { render, screen } from "@testing-library/react"
import About from "../../components/homepage/About"

// Mock the MDX component
jest.mock("../../content/sections/about.mdx", () => {
  return function AboutMock() {
    return <div data-testid="about-content">About Content</div>
  }
})

// Shared manual mocks live next to each module, in its __mocks__ directory
jest.mock("../../components/elements/Divider")
jest.mock("../../components/elements/Content")
jest.mock("../../components/elements/Inner")
jest.mock("../../components/homepage/Svg")
jest.mock("../../styles/animations")

describe("About Component", () => {
  it("renders without crashing", () => {
    render(<About offset={2} factor={1} />)
    expect(screen.getByTestId("about-content")).toBeInTheDocument()
  })

  it("applies the about preset", () => {
    const { container } = render(<About offset={2} factor={1} />)
    const section = container.querySelector(".section")
    expect(section).toHaveAttribute("data-icon-preset", "about")
  })

  it("renders divider with clipPath", () => {
    render(<About offset={2} factor={1} />)
    const dividers = screen.getAllByTestId("divider")
    expect(dividers.length).toBeGreaterThan(0)
  })

  it("renders icon animations", () => {
    render(<About offset={2} factor={1} />)
    expect(screen.getByTestId("updown")).toBeInTheDocument()
    expect(screen.getByTestId("updownwide")).toBeInTheDocument()
  })

  it("renders background icons", () => {
    render(<About offset={2} factor={1} />)
    const icons = screen.getAllByTestId("icon")
    expect(icons.length).toBeGreaterThan(0)
  })

  it("renders content layer with proper z-index", () => {
    render(<About offset={2} factor={1} />)
    const content = screen.getByTestId("content")
    expect(content).toHaveClass("content")
  })
})
