import React from 'react'
import { render, screen } from '@testing-library/react'
import Projects from '../../@lekoarts/gatsby-theme-cara/components/projects'

// Mock the MDX component
jest.mock('../../@lekoarts/gatsby-theme-cara/sections/projects.mdx', () => {
  return function ProjectsMock() {
    return <div data-testid="projects-content">Projects Content</div>
  }
})

// Mock components
jest.mock('@lekoarts/gatsby-theme-cara/src/elements/divider', () => {
  return function DividerMock({ children, className }: any) {
    return <div data-testid="divider" className={className}>{children}</div>
  }
})

jest.mock('@lekoarts/gatsby-theme-cara/src/elements/content', () => {
  return function ContentMock({ children, className }: any) {
    return <div data-testid="content" className={className}>{children}</div>
  }
})

jest.mock('@lekoarts/gatsby-theme-cara/src/elements/inner', () => {
  return function InnerMock({ children }: any) {
    return <div data-testid="inner">{children}</div>
  }
})

jest.mock('../../@lekoarts/gatsby-theme-cara/components/svg', () => {
  return function SvgMock() {
    return <svg data-testid="icon" />
  }
})

jest.mock('@lekoarts/gatsby-theme-cara/src/styles/animations', () => ({
  UpDown: ({ children }: any) => <div data-testid="updown">{children}</div>,
  UpDownWide: ({ children }: any) => <div data-testid="updownwide">{children}</div>,
}))

describe('Projects Component', () => {
  it('renders without crashing', () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByTestId('projects-content')).toBeInTheDocument()
  })

  it('applies the projects preset', () => {
    const { container } = render(<Projects offset={1} factor={2} />)
    const section = container.querySelector('.section')
    expect(section).toHaveAttribute('data-icon-preset', 'projects')
  })

  it('renders gradient divider', () => {
    render(<Projects offset={1} factor={2} />)
    const dividers = screen.getAllByTestId('divider')
    expect(dividers.length).toBeGreaterThan(0)
  })

  it('renders icon canvas with animations', () => {
    render(<Projects offset={1} factor={2} />)
    expect(screen.getByTestId('updown')).toBeInTheDocument()
    expect(screen.getByTestId('updownwide')).toBeInTheDocument()
  })

  it('renders background icons', () => {
    render(<Projects offset={1} factor={2} />)
    const icons = screen.getAllByTestId('icon')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('renders content with proper layering', () => {
    render(<Projects offset={1} factor={2} />)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('content')
  })
})
