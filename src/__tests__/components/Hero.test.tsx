import React from 'react'
import { render, screen } from '@testing-library/react'
import Hero from '../../@lekoarts/gatsby-theme-cara/components/hero'

// Mock the TSX component (not MDX)
jest.mock('../../@lekoarts/gatsby-theme-cara/sections/intro', () => {
  return function IntroMock() {
    return <div data-testid="intro-content">Hero Content</div>
  }
})

// Mock the Divider component
jest.mock('@lekoarts/gatsby-theme-cara/src/elements/divider', () => {
  return function DividerMock({ children, className }: any) {
    return <div data-testid="divider" className={className}>{children}</div>
  }
})

// Mock the Content component
jest.mock('@lekoarts/gatsby-theme-cara/src/elements/content', () => {
  return function ContentMock({ children, className }: any) {
    return <div data-testid="content" className={className}>{children}</div>
  }
})

// Mock the Inner component
jest.mock('@lekoarts/gatsby-theme-cara/src/elements/inner', () => {
  return function InnerMock({ children }: any) {
    return <div data-testid="inner">{children}</div>
  }
})

// Mock the SVG component
jest.mock('../../@lekoarts/gatsby-theme-cara/components/svg', () => {
  return function SvgMock() {
    return <svg data-testid="icon" />
  }
})

// Mock animation components
jest.mock('@lekoarts/gatsby-theme-cara/src/styles/animations', () => ({
  UpDown: ({ children }: any) => <div data-testid="updown">{children}</div>,
  UpDownWide: ({ children }: any) => <div data-testid="updownwide">{children}</div>,
}))

describe('Hero Component', () => {
  it('renders without crashing', () => {
    render(<Hero offset={0} factor={1} />)
    expect(screen.getByTestId('intro-content')).toBeInTheDocument()
  })

  it('applies the correct section preset', () => {
    const { container } = render(<Hero offset={0} factor={1} />)
    const section = container.querySelector('.section')
    expect(section).toHaveAttribute('data-icon-preset', 'hero')
  })

  it('renders icon canvas layer', () => {
    render(<Hero offset={0} factor={1} />)
    const iconCanvas = screen.getAllByTestId('divider').find(el => el.classList.contains('iconCanvas'))
    expect(iconCanvas).toBeInTheDocument()
  })

  it('renders content layer', () => {
    render(<Hero offset={0} factor={1} />)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('content')
  })

  it('renders background icons', () => {
    render(<Hero offset={0} factor={1} />)
    const icons = screen.getAllByTestId('icon')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('renders animation wrappers', () => {
    render(<Hero offset={0} factor={1} />)
    expect(screen.getByTestId('updown')).toBeInTheDocument()
    expect(screen.getByTestId('updownwide')).toBeInTheDocument()
  })
})
