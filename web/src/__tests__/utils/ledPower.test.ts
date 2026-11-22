import { estimatePower, wireGaugeFor } from "../../utils/ledPower"

const base = { ledCount: 60, brightnessLimit: 100, averageLoad: 100, controllerMa: 0, batteryMah: 0 }

describe("estimatePower", () => {
  it("uses 60 mA per LED at full white", () => {
    const estimate = estimatePower(base)
    expect(estimate.worstCaseA).toBeCloseTo(3.6)
    expect(estimate.typicalA).toBeCloseTo(3.6)
    expect(estimate.typicalW).toBeCloseTo(18)
  })

  it("scales the worst case by the brightness limit and the typical draw by the load too", () => {
    const estimate = estimatePower({ ...base, brightnessLimit: 50, averageLoad: 25, controllerMa: 100 })
    expect(estimate.worstCaseA).toBeCloseTo(1.9) // 60 × 60 mA × 0.5 + 100 mA
    expect(estimate.typicalA).toBeCloseTo(0.55) // 60 × 60 mA × 0.5 × 0.25 + 100 mA
  })

  it("sizes the supply at the worst case plus 25%, rounded up to whole amps", () => {
    expect(estimatePower(base).supplyA).toBe(5) // 3.6 A × 1.25 = 4.5 A
    expect(estimatePower({ ...base, ledCount: 1 }).supplyA).toBe(1)
  })

  it("estimates runtime from 60% of the printed battery capacity", () => {
    const estimate = estimatePower({ ...base, ledCount: 10, averageLoad: 50, batteryMah: 10000 })
    // 10 × 60 mA × 0.5 = 300 mA; 10000 mAh × 0.6 / 300 mA = 20 h
    expect(estimate.runtimeHours).toBeCloseTo(20)
  })

  it("has no runtime without a battery", () => {
    expect(estimatePower(base).runtimeHours).toBeNull()
  })

  it("treats blank or out-of-range inputs as their nearest valid value", () => {
    const estimate = estimatePower({
      ledCount: NaN,
      brightnessLimit: 500,
      averageLoad: -3,
      controllerMa: NaN,
      batteryMah: -1,
    })
    expect(estimate.worstCaseA).toBe(0)
    expect(estimate.runtimeHours).toBeNull()
    expect(estimate.supplyA).toBe(1)
  })
})

describe("wireGaugeFor", () => {
  it("picks thicker wire for more current", () => {
    expect(wireGaugeFor(1.5)).toBe(22)
    expect(wireGaugeFor(3.6)).toBe(20)
    expect(wireGaugeFor(6)).toBe(18)
    expect(wireGaugeFor(9)).toBe(16)
    expect(wireGaugeFor(18)).toBe(14)
  })
})
