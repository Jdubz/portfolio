// Manual mock: used by any test that calls jest.mock() on this module with no factory.
import React from "react"

const Divider = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div data-testid="divider" className={className}>
    {children}
  </div>
)

export default Divider
