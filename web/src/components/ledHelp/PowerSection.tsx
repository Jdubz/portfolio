/** @jsx jsx */
import { jsx } from "theme-ui"
import { GuideSection, DataTable, Callout, CardGrid, InfoCard } from "./primitives"
import PowerCalculator from "./PowerCalculator"

const exampleRows = [
  ["Ring of 24", "1.4 A", "0.6 A", "0.2 A", "USB power bank or USB wall charger"],
  ["1 m strip, 60/m", "3.6 A", "1.4 A", "0.5 A", "USB power bank at 50% brightness or less; 5V 4 A supply"],
  ["Hat or scarf, ~100 LEDs", "6.0 A", "2.4 A", "0.8 A", "USB power bank, brightness limited"],
  ["16×16 matrix (256)", "15.4 A", "6.1 A", "2.0 A", "5V 10 A supply, or a power bank at a low limit"],
  ["5 m strip, 60/m (300)", "18.0 A", "7.2 A", "2.4 A", "5V 10–20 A supply with power injection"],
]

const gaugeRows = [
  ["Up to 2 A", "22 AWG", "Single strips, small wearables"],
  ["Up to 4 A", "20 AWG", "A metre or two of 60/m at moderate brightness"],
  ["Up to 6 A", "18 AWG", "Larger wearables, small sculptures"],
  ["Up to 10 A", "16 AWG", "Matrices, multi-metre runs"],
  ["Over 10 A", "14 AWG, and split into several injection runs", "Installations"],
]

const PowerSection = () => (
  <GuideSection
    id="power"
    label="Part 2"
    title="Power"
    intro="Every project in this workshop runs on 5 volts: USB power banks, 5V batteries and 5V supplies. No 12V or 24V systems."
  >
    <p>
      5V is the voltage WS2812B-class LEDs want, it&rsquo;s what USB delivers, and it&rsquo;s low enough to wear on your
      body. The cost is current: at 5V, LEDs need a lot of amps, so the questions that matter are{" "}
      <strong>how many amps, for how long, and over what wire</strong>.
    </p>

    <h3>How much power do you need?</h3>
    <p>
      Each RGB pixel draws about <strong>60 mA at full white</strong> (20 mA per colour). The worst case is easy:
    </p>
    <p sx={{ variant: "cards.surface", px: 4, py: 3, fontFamily: "monospace", fontSize: [1, 2], color: "heading" }}>
      amps = number of LEDs × 0.06 × brightness limit
    </p>
    <p>
      Real animations rarely light every pixel white. Fire averages around a quarter of the maximum, a rainbow about a
      third. Size your <strong>power supply</strong> for the worst case (so it never browns out) and your{" "}
      <strong>battery</strong> for the typical draw (so you know how long it lasts).
    </p>
    <DataTable
      caption="Examples (typical assumes an animation averaging a third of the limit)"
      columns={["Project", "Full white, 100%", "Full white, 40% limit", "Typical at 40%", "What powers it"]}
      rows={exampleRows}
    />
    <PowerCalculator />
    <Callout title="Set a brightness limit">
      <p>
        Your eyes respond to light on a curve: 40% brightness looks much closer to 100% than the number suggests, and it
        uses less than half the power. A limit in the controller (WLED calls it the current limiter) also protects your
        supply, your wires and your battery. Most wearables look great at 20–40%, especially at night.
      </p>
    </Callout>

    <h3>Power sources</h3>
    <CardGrid>
      <InfoCard title="USB power banks">
        <p>
          The easiest choice for wearables and portable pieces: already 5V, rechargeable, protected, and they come in
          every size.
        </p>
        <ul>
          <li>
            Check the output rating on each port: usually <strong>2.1–3 A</strong>. That&rsquo;s your ceiling, so set
            the brightness limit to match.
          </li>
          <li>
            Some banks turn themselves off when the draw is low (a dim animation, or a pause). Look for one with a
            low-current or &ldquo;always on&rdquo; mode, or test yours before the event.
          </li>
          <li>
            Connect with a USB cable you cut open, or a USB pigtail or breakout board. Red is +5V and black is ground;
            check with a meter.
          </li>
          <li>
            Runtime: roughly 60% of the printed mAh reaches the LEDs at 5V. The calculator above accounts for this.
          </li>
        </ul>
      </InfoCard>
      <InfoCard title="LiPo cells (3.7V) with a 5V boost">
        <p>Thinner and lighter than a power bank, so good for tight builds like hats, props and jewellery.</p>
        <ul>
          <li>
            A single cell is 3.7V nominal (4.2V full). WS2812Bs will often run straight from it, but blues and whites
            dim and colours drift as it drains. For a true 5V system, add a <strong>5V boost converter</strong> rated
            for your current.
          </li>
          <li>
            Buy cells with a built-in protection circuit. Charge them with a proper LiPo charger. Retire any cell that
            puffs up.
          </li>
          <li>
            JST battery connectors are <strong>not</strong> standardised: red and black are swapped between brands.
            Check polarity before plugging in.
          </li>
          <li>The XIAO board that blinky-time runs on can charge a small LiPo from its USB-C port.</li>
        </ul>
      </InfoCard>
      <InfoCard title="AA batteries">
        <ul>
          <li>
            <strong>4 × NiMH rechargeables</strong> = 4.8V. Good.
          </li>
          <li>
            <strong>3 × alkaline</strong> = 4.5V. Good.
          </li>
          <li>
            <strong>4 × alkaline</strong> = 6V. Too high: it can destroy LEDs. Don&rsquo;t.
          </li>
        </ul>
        <p>
          AAs can&rsquo;t deliver much current, so they suit small projects (a ring or a short strip) at low brightness.
        </p>
      </InfoCard>
      <InfoCard title="Wall power supplies">
        <ul>
          <li>
            <strong>USB wall chargers</strong> handle small projects up to their rating, usually 2–3 A.
          </li>
          <li>
            <strong>5V power bricks</strong> (laptop-style, 4–10 A, with a barrel jack) are the safe choice for bigger
            pieces. Use a female barrel-jack-to-screw-terminal adapter to connect.
          </li>
          <li>
            <strong>Enclosed supplies</strong> (Mean Well LRS-50-5 = 10 A, LRS-100-5 = 18 A) need mains wiring. Only use
            one if you&rsquo;ve wired mains before, in a closed enclosure with strain relief. Never on anything worn.
          </li>
        </ul>
      </InfoCard>
    </CardGrid>

    <h3>Getting power to the LEDs</h3>
    <h4>Voltage drop and power injection</h4>
    <p>
      The copper in a strip is thin. Push a few amps down it and the far end gets a lower voltage: it gets dimmer and
      white turns orange or pink. The fix is <strong>power injection</strong>: run separate +5V and ground wires from
      the supply to points along the strip. As a rule of thumb, inject every 1–2 m of 60/m strip (every 100–150 LEDs),
      and feed long runs from both ends. Only the data line runs pixel to pixel.
    </p>
    <h4>Wire size</h4>
    <DataTable
      caption="Main power wire for short 5V runs (under ~2 m)"
      columns={["Current", "Wire", "Typical use"]}
      rows={gaugeRows}
    />
    <p>
      Use stranded, <strong>silicone-insulated</strong> wire: it stays flexible, survives soldering heat and
      doesn&rsquo;t crack in the cold. Longer runs need thicker wire.
    </p>
    <h4>The small parts that prevent most problems</h4>
    <ul>
      <li>
        <strong>Capacitor:</strong> 470–1000 µF (rated 6.3V or higher) across +5V and ground where power enters the
        strip. It absorbs the surge when everything switches on.
      </li>
      <li>
        <strong>Data resistor:</strong> 220–470 Ω in series with the data line, close to the first LED. It protects that
        pixel and cleans up the signal.
      </li>
      <li>
        <strong>Common ground:</strong> the controller&rsquo;s ground must connect to the LED ground, even when they
        have separate power sources. Without it, data doesn&rsquo;t work.
      </li>
      <li>
        <strong>Don&rsquo;t power LEDs through the controller.</strong> Feed the strip straight from the supply and
        power the controller from the same source. A controller&rsquo;s USB port and 5V pin are good for a handful of
        pixels at most.
      </li>
      <li>
        <strong>Fuse:</strong> above about 5 A, put an inline fuse on each power run, rated below what that wire can
        carry.
      </li>
      <li>
        <strong>Switch:</strong> an inline on/off switch saves unplugging a battery in the dark.
      </li>
    </ul>

    <h3 id="logic-levels">3.3V vs 5V logic, and level shifting</h3>
    <p>
      Most modern controllers (ESP32, RP2040, and the nRF52840 that blinky-time runs on) send data at{" "}
      <strong>3.3V</strong>. A WS2812B powered from 5V wants a &ldquo;high&rdquo; signal of at least 70% of its supply,
      about <strong>3.5V</strong>. So 3.3V is just under spec. It often works on the bench with a short data wire, then
      flickers, shows random colours or glitches on the first pixel once the wire gets longer or the supply sits a
      little high.
    </p>
    <CardGrid columns={3}>
      <InfoCard title="Best: a level shifter chip">
        <p>
          A <strong>74AHCT125</strong> (or 74HCT245, or the single-channel SN74AHCT1G125), powered from 5V, turns the
          3.3V signal into a clean 5V one. It costs about $1. Put it near the controller.
        </p>
        <p>
          Avoid the generic bidirectional &ldquo;BSS138&rdquo; level-shifter modules: they&rsquo;re too slow for LED
          data.
        </p>
      </InfoCard>
      <InfoCard title="Good: the sacrificial pixel">
        <p>
          Power the first pixel through a diode (such as a 1N4001) so it runs at about 4.3V. Its threshold drops low
          enough to read 3.3V reliably, and it passes a strong signal on to the rest of the strip.
        </p>
      </InfoCard>
      <InfoCard title="Fine for prototypes: keep it short">
        <p>
          A short data wire (under ~30 cm) with the series resistor usually works without shifting. If you see flicker,
          add a shifter before you add anything else.
        </p>
      </InfoCard>
    </CardGrid>
    <p>
      Pre-built WLED controllers such as QuinLED boards include level shifting; check the listing for others. Classic 5V
      Arduinos (Uno, Nano) output 5V data and need no shifting.
    </p>

    <Callout tone="warning" title="Safety">
      <ul>
        <li>
          LiPo cells can catch fire if punctured, crushed, shorted or overcharged. Protect them in a hard case on
          wearables, and never charge them unattended.
        </li>
        <li>
          Dense strips at high brightness get hot enough to hurt skin and soften plastics. Limit brightness and test for
          an hour before you wear it.
        </li>
        <li>
          Fuse anything larger than a power bank, and insulate every joint with heat shrink. A short across a 5V 10 A
          supply melts wire.
        </li>
      </ul>
    </Callout>
  </GuideSection>
)

export default PowerSection
