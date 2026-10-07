// Manual mock: used by any test that calls jest.mock() on this module with no factory.
import React from "react"

type Props = { children?: React.ReactNode }

export const UpDown = ({ children }: Props) => <div data-testid="updown">{children}</div>
export const UpDownWide = ({ children }: Props) => <div data-testid="updownwide">{children}</div>
export const waveAnimation = () => "wave-animation"
