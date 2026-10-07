// Manual mock: used by any test that calls jest.mock() on this module with no factory.
import React from "react"

const Inner = ({ children }: { children?: React.ReactNode }) => <div data-testid="inner">{children}</div>

export default Inner
