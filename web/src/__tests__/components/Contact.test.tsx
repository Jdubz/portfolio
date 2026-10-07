import React from "react"
import { render, screen } from "@testing-library/react"
import Contact from "../../components/homepage/Contact"

// Mock the MDX component
jest.mock("../../content/sections/contact.mdx", () => {
  return function ContactMock() {
    return <div data-testid="contact-content">Contact Content</div>
  }
})

// Mock Footer component
jest.mock("../../components/homepage/Footer", () => {
  return function FooterMock() {
    return <footer data-testid="footer">Footer</footer>
  }
})

// Shared manual mocks live next to each module, in its __mocks__ directory
jest.mock("../../components/elements/Divider")
jest.mock("../../components/elements/Content")
jest.mock("../../components/elements/Inner")
jest.mock("../../components/homepage/Svg")
jest.mock("../../styles/animations")

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
