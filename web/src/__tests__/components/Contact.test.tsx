import React from "react"
import { render, screen } from "@testing-library/react"
import Contact from "../../@lekoarts/gatsby-theme-cara/components/contact"

// Mock the MDX component
jest.mock("../../@lekoarts/gatsby-theme-cara/sections/contact.mdx", () => {
  return function ContactMock() {
    return <div data-testid="contact-content">Contact Content</div>
  }
})

// Mock Footer component
jest.mock("../../@lekoarts/gatsby-theme-cara/components/footer", () => {
  return function FooterMock() {
    return <footer data-testid="footer">Footer</footer>
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
  waveAnimation: jest.fn(() => "wave-animation"),
}))

describe("Contact Component", () => {
  it("renders without crashing", () => {
    render(<Contact offset={3} factor={1} />)
    expect(screen.getByTestId("contact-content")).toBeInTheDocument()
  })

  it("applies the contact preset", () => {
    const { container } = render(<Contact offset={3} factor={1} />)
    const section = container.querySelector(".section")
    expect(section).toHaveAttribute("data-icon-preset", "contact")
  })

  it("renders footer component", () => {
    render(<Contact offset={3} factor={1} />)
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("renders wave animation divider", () => {
    render(<Contact offset={3} factor={1} />)
    const dividers = screen.getAllByTestId("divider")
    expect(dividers.length).toBeGreaterThan(0)
  })

  it("renders icon canvas with minimal icons", () => {
    render(<Contact offset={3} factor={1} />)
    const iconCanvas = screen.getAllByTestId("divider").find((el) => el.classList.contains("iconCanvas"))
    expect(iconCanvas).toBeInTheDocument()
  })

  it("renders animation wrappers", () => {
    render(<Contact offset={3} factor={1} />)
    expect(screen.getByTestId("updown")).toBeInTheDocument()
    expect(screen.getByTestId("updownwide")).toBeInTheDocument()
  })

  it("renders background icons", () => {
    render(<Contact offset={3} factor={1} />)
    const icons = screen.getAllByTestId("icon")
    expect(icons.length).toBeGreaterThan(0)
  })

  it("renders content layer", () => {
    render(<Contact offset={3} factor={1} />)
    const content = screen.getByTestId("content")
    expect(content).toHaveClass("content")
  })
})
