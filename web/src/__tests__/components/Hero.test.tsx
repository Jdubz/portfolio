import React from "react"
import { render, screen } from "@testing-library/react"
import Hero from "../../components/homepage/Hero"

// Mock the MDX component
jest.mock("../../content/sections/intro.mdx", () => {
  return function IntroMock() {
    return <div data-testid="intro-content">Hero Content</div>
  }
})

// Shared manual mocks live next to each module, in its __mocks__ directory
jest.mock("../../components/elements/Divider")
jest.mock("../../components/elements/Content")
jest.mock("../../components/elements/Inner")
jest.mock("../../components/homepage/Svg")
jest.mock("../../styles/animations")

describe("Hero Component", () => {
  it("renders without crashing", () => {
    render(<Hero offset={0} factor={1} />)
    expect(screen.getByTestId("intro-content")).toBeInTheDocument()
  })

  it("applies the correct section preset", () => {
    const { container } = render(<Hero offset={0} factor={1} />)
    const section = container.querySelector(".section")
    expect(section).toHaveAttribute("data-icon-preset", "hero")
  })

  it("renders icon canvas layer", () => {
    render(<Hero offset={0} factor={1} />)
    const iconCanvas = screen.getAllByTestId("divider").find((el) => el.classList.contains("iconCanvas"))
    expect(iconCanvas).toBeInTheDocument()
  })

  it("renders content layer", () => {
    render(<Hero offset={0} factor={1} />)
    const content = screen.getByTestId("content")
    expect(content).toHaveClass("content")
  })

  it("renders background icons", () => {
    render(<Hero offset={0} factor={1} />)
    const icons = screen.getAllByTestId("icon")
    expect(icons.length).toBeGreaterThan(0)
  })

  it("renders animation wrappers", () => {
    render(<Hero offset={0} factor={1} />)
    expect(screen.getByTestId("updown")).toBeInTheDocument()
    expect(screen.getByTestId("updownwide")).toBeInTheDocument()
  })
})
