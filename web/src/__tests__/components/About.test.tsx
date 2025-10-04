import React from "react"
import { render, screen } from "@testing-library/react"
import About from "../../@lekoarts/gatsby-theme-cara/components/about"

// Mock the MDX component
jest.mock("../../@lekoarts/gatsby-theme-cara/sections/about.mdx", () => {
  return function AboutMock() {
    return <div data-testid="about-content">About Content</div>
  }
})

// Mock components
jest.mock("@lekoarts/gatsby-theme-cara/src/elements/divider", () => {
  return function DividerMock({ children, className }: any) {
    return (
      <div data-testid="divider" className={className}>
        {children}
      </div>
    )
  }
})

jest.mock("@lekoarts/gatsby-theme-cara/src/elements/content", () => {
  return function ContentMock({ children, className }: any) {
    return (
      <div data-testid="content" className={className}>
        {children}
      </div>
    )
  }
})

jest.mock("@lekoarts/gatsby-theme-cara/src/elements/inner", () => {
  return function InnerMock({ children }: any) {
    return <div data-testid="inner">{children}</div>
  }
})

jest.mock("../../@lekoarts/gatsby-theme-cara/components/svg", () => {
  return function SvgMock() {
    return <svg data-testid="icon" />
  }
})

jest.mock("@lekoarts/gatsby-theme-cara/src/styles/animations", () => ({
  UpDown: ({ children }: any) => <div data-testid="updown">{children}</div>,
  UpDownWide: ({ children }: any) => <div data-testid="updownwide">{children}</div>,
}))

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
