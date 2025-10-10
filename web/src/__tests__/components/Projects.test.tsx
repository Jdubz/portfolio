import React from "react"
import { render, screen } from "@testing-library/react"
import Projects from "../../components/homepage/Projects"

// Mock the MDX component
jest.mock("../../content/sections/projects.mdx", () => {
  return function ProjectsMock() {
    return <div data-testid="projects-content">Projects Content</div>
  }
})

// Mock components
jest.mock("../../components/elements/Divider", () => {
  return function DividerMock({ children, className }: any) {
    return (
      <div data-testid="divider" className={className}>
        {children}
      </div>
    )
  }
})

jest.mock("../../components/elements/Content", () => {
  return function ContentMock({ children, className }: any) {
    return (
      <div data-testid="content" className={className}>
        {children}
      </div>
    )
  }
})

jest.mock("../../components/elements/Inner", () => {
  return function InnerMock({ children }: any) {
    return <div data-testid="inner">{children}</div>
  }
})

jest.mock("../../components/homepage/Svg", () => {
  return function SvgMock() {
    return <svg data-testid="icon" />
  }
})

jest.mock("../../styles/animations", () => ({
  UpDown: ({ children }: any) => <div data-testid="updown">{children}</div>,
  UpDownWide: ({ children }: any) => <div data-testid="updownwide">{children}</div>,
}))

describe("Projects Component", () => {
  it("renders without crashing", () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByTestId("projects-content")).toBeInTheDocument()
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
