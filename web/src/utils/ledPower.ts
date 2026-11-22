/**
 * Power estimates for 5V addressable LED projects (the /led-help workshop guide).
 *
 * The numbers are planning figures, not measurements: a WS2812B-class pixel draws about 60 mA at
 * full white (20 mA per colour channel), and real animations average well below that.
 */

/** Current one RGB pixel draws at full white on 5V */
export const MAX_MA_PER_LED = 60

/** Margin added on top of the worst case when choosing a power supply */
export const SUPPLY_HEADROOM = 1.25

/**
 * Share of a USB power bank's printed capacity that reaches the LEDs. The label is mAh at the
 * cell's 3.7V; boosting to 5V and conversion losses leave roughly 60% of it.
 */
export const POWER_BANK_EFFICIENCY = 0.6

export type PowerInput = {
  /** Number of pixels */
  ledCount: number
  /** Brightness limit set in the controller, 1–100 (%) */
  brightnessLimit: number
  /** How much of that limit the animation uses on average, 1–100 (%) */
  averageLoad: number
  /** The controller's own draw (mA) */
  controllerMa: number
  /** Battery or power bank capacity as printed (mAh); 0 for none */
  batteryMah: number
}

export type PowerEstimate = {
  /** Every pixel full white at the brightness limit, plus the controller (A) */
  worstCaseA: number
  /** Expected average draw (A) */
  typicalA: number
  /** Typical power (W) */
  typicalW: number
  /** Smallest supply worth buying: worst case plus headroom, rounded up to the next amp (A) */
  supplyA: number
  /** Runtime on the battery at the typical draw (hours), or null with no battery */
  runtimeHours: number | null
  /** Main power wire size for the worst case (AWG) */
  wireAwg: number
}

const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min

/** Conservative wire size for a short 5V run carrying `amps` */
export const wireGaugeFor = (amps: number): number => {
  if (amps <= 2) {
    return 22
  }
  if (amps <= 4) {
    return 20
  }
  if (amps <= 6) {
    return 18
  }
  if (amps <= 10) {
    return 16
  }
  return 14
}

export const estimatePower = (input: PowerInput): PowerEstimate => {
  const ledCount = clamp(Math.round(input.ledCount), 0, 100000)
  const limit = clamp(input.brightnessLimit, 1, 100) / 100
  const load = clamp(input.averageLoad, 1, 100) / 100
  const controllerMa = clamp(input.controllerMa, 0, 10000)
  const batteryMah = clamp(input.batteryMah, 0, 1000000)

  const worstCaseMa = ledCount * MAX_MA_PER_LED * limit + controllerMa
  const typicalMa = ledCount * MAX_MA_PER_LED * limit * load + controllerMa

  const worstCaseA = worstCaseMa / 1000
  const typicalA = typicalMa / 1000

  return {
    worstCaseA,
    typicalA,
    typicalW: typicalA * 5,
    supplyA: Math.max(1, Math.ceil(worstCaseA * SUPPLY_HEADROOM)),
    runtimeHours: batteryMah > 0 && typicalMa > 0 ? (batteryMah * POWER_BANK_EFFICIENCY) / typicalMa : null,
    wireAwg: wireGaugeFor(worstCaseA),
  }
}
