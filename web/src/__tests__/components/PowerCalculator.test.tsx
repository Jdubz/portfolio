import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import PowerCalculator from "../../components/ledHelp/PowerCalculator"

const setField = (label: string, value: string) =>
  fireEvent.change(screen.getByRole("spinbutton", { name: new RegExp(label) }), { target: { value } })

describe("PowerCalculator", () => {
  it("recalculates as the inputs change", () => {
    render(<PowerCalculator />)

    setField("Number of LEDs", "100")
    setField("Brightness limit", "100")
    setField("Average load", "50")
    setField("Controller draw", "0")
    setField("Power bank capacity", "0")

    expect(screen.getByText("6.00 A")).toBeInTheDocument() // worst case: 100 × 60 mA
    expect(screen.getByText("3.00 A")).toBeInTheDocument() // typical: half of that
    expect(screen.getByText("5V 8 A")).toBeInTheDocument() // 6 A × 1.25 = 7.5, rounded up
    expect(screen.getByText("—")).toBeInTheDocument() // no battery
  })

  it("shows the runtime on a battery", () => {
    render(<PowerCalculator />)

    setField("Number of LEDs", "10")
    setField("Brightness limit", "100")
    setField("Average load", "50")
    setField("Controller draw", "0")
    setField("Power bank capacity", "1000")

    // 300 mA from 1000 mAh × 0.6 = 2 h
    expect(screen.getByText("2 h 0 min")).toBeInTheDocument()
  })
})
