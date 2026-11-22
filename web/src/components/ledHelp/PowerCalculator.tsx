/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { estimatePower, type PowerInput } from "../../utils/ledPower"

type Field = {
  key: keyof PowerInput
  label: string
  hint: string
  min: number
  max: number
  step: number
}

const fields: Field[] = [
  { key: "ledCount", label: "Number of LEDs", hint: "Total pixels in the project", min: 0, max: 5000, step: 1 },
  {
    key: "brightnessLimit",
    label: "Brightness limit (%)",
    hint: "The maximum you set in the controller. 30–50% is usually plenty",
    min: 1,
    max: 100,
    step: 1,
  },
  {
    key: "averageLoad",
    label: "Average load (%)",
    hint: "How much of that the animation uses: fire ~25, rainbow ~33, solid white 100",
    min: 1,
    max: 100,
    step: 1,
  },
  {
    key: "controllerMa",
    label: "Controller draw (mA)",
    hint: "blinky-time ~50, ESP32 with Wi-Fi ~150–250",
    min: 0,
    max: 1000,
    step: 10,
  },
  {
    key: "batteryMah",
    label: "Power bank capacity (mAh)",
    hint: "As printed on it. 0 if plugged into the wall",
    min: 0,
    max: 50000,
    step: 100,
  },
]

const initial: PowerInput = { ledCount: 60, brightnessLimit: 50, averageLoad: 33, controllerMa: 100, batteryMah: 10000 }

const formatHours = (hours: number) => {
  if (hours >= 100) {
    return "100+ h"
  }
  if (hours >= 10) {
    return `${Math.round(hours)} h`
  }
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  return whole > 0 ? `${whole} h ${minutes} min` : `${minutes} min`
}

const Result = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div sx={{ p: 3, borderRadius: "lg", border: "1px solid", borderColor: "divider", bg: "background" }}>
    {/* divs, not p: the guide's prose styles give every p a bottom margin */}
    <div sx={{ fontSize: 1, color: "textMuted" }}>{label}</div>
    <div sx={{ fontSize: [4, 5], fontWeight: 700, color: "heading", my: 1, fontVariantNumeric: "tabular-nums" }}>
      {value}
    </div>
    <div sx={{ fontSize: 0, color: "textMuted", lineHeight: 1.4 }}>{note}</div>
  </div>
)

const PowerCalculator = () => {
  const [values, setValues] = React.useState<Record<keyof PowerInput, string>>(() => {
    const entries = Object.entries(initial).map(([key, value]) => [key, String(value)])
    return Object.fromEntries(entries) as Record<keyof PowerInput, string>
  })

  const estimate = estimatePower({
    ledCount: Number(values.ledCount),
    brightnessLimit: Number(values.brightnessLimit),
    averageLoad: Number(values.averageLoad),
    controllerMa: Number(values.controllerMa),
    batteryMah: Number(values.batteryMah),
  })

  return (
    <div sx={{ variant: "cards.surface", p: [3, 4], mb: 4 }} role="group" aria-labelledby="power-calc-title">
      <h4 id="power-calc-title" sx={{ fontSize: [3, 4], color: "heading", mt: 0, mb: 3 }}>
        Power calculator
      </h4>
      <div
        sx={{ display: "grid", gap: 3, gridTemplateColumns: ["1fr", null, "repeat(2, 1fr)", "repeat(3, 1fr)"], mb: 4 }}
      >
        {fields.map((field) => (
          <label key={field.key} sx={{ display: "grid", gap: 1, alignContent: "start", fontSize: 1 }}>
            <span sx={{ fontWeight: 600, color: "heading" }}>{field.label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.key]}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              sx={{
                font: "inherit",
                fontSize: 2,
                color: "text",
                bg: "background",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "md",
                px: 3,
                py: 2,
                width: "100%",
                "&:focus-visible": { outline: "2px solid", outlineColor: "link", outlineOffset: "1px" },
              }}
            />
            <span sx={{ color: "textMuted", fontSize: 0, lineHeight: 1.4 }}>{field.hint}</span>
          </label>
        ))}
      </div>
      <div
        aria-live="polite"
        sx={{ display: "grid", gap: 3, gridTemplateColumns: ["1fr", "repeat(2, 1fr)", null, "repeat(4, 1fr)"] }}
      >
        <Result
          label="Worst case"
          value={`${estimate.worstCaseA.toFixed(2)} A`}
          note="Every LED full white at your brightness limit"
        />
        <Result
          label="Typical"
          value={`${estimate.typicalA.toFixed(2)} A`}
          note={`About ${estimate.typicalW.toFixed(1)} W while animating`}
        />
        <Result
          label="Supply to buy"
          value={`5V ${estimate.supplyA} A`}
          note={`Worst case + 25%. Main wires: ${estimate.wireAwg} AWG or thicker`}
        />
        <Result
          label="Battery runtime"
          value={estimate.runtimeHours === null ? "—" : formatHours(estimate.runtimeHours)}
          note="At the typical draw, using ~60% of the printed capacity"
        />
      </div>
    </div>
  )
}

export default PowerCalculator
