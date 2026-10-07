// Manual mock: used by any test that calls jest.mock() on this module with no factory.
import React from "react"

const Content = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div data-testid="content" className={className}>
    {children}
  </div>
)

export default Content
