/** @jsx jsx */
import { jsx } from "theme-ui"
import { GuideSection, DataTable, Callout, CardGrid, InfoCard } from "./primitives"

const ledColumns = ["Product", "Size / spacing", "Approx. cost", "Durability", "Ease of use", "Good for"]

const ledRows = [
  [
    "WS2812B strip (30, 60 or 144 LEDs/m)",
    "10–12 mm wide flexible strip; 33, 16.6 or 7 mm between pixels",
    "$5–8/m at 60/m from budget sellers; $20–30/m from Adafruit; 144/m about 2–3× the 60/m price",
    "Bare (IP30) is indoor only and the pads tear if flexed hard. Silicone-coated (IP65) and silicone-sleeved (IP67) survive sweat and weather",
    "Easiest. Cut between any two pixels, solder three pads, follow the arrows",
    "Almost everything: costumes, outlines, shelves, sculpture edges",
  ],
  [
    "SK6812 RGBW strip",
    "Same sizes as WS2812B, with a fourth (white) LED in each pixel",
    "About 1.5× WS2812B",
    "Same as WS2812B",
    "Easy, but the controller must support RGBW (WLED does; blinky-time does not)",
    "Warm or natural white, pastels, room lighting",
  ],
  [
    "APA102 / SK9822 (“DotStar”) strip",
    "Same sizes as WS2812B; four wires (power, ground, data, clock)",
    "$15–30/m",
    "Same as WS2812B",
    "Moderate: one more wire, and not every controller supports it (blinky-time does not)",
    "Very fast animation, persistence-of-vision, anything that will be filmed",
  ],
  [
    "Pixel string (12 mm “bullet” nodes on wire)",
    "One sealed pixel every 5–10 cm on flexible wire, usually 50 to a string",
    "$15–25 per 50",
    "Very tough: IP68, made for outdoor signs",
    "Easy: plugs together with the connectors on each end. Make sure you buy the 5V version",
    "Sculpture, letters and shapes pushed through holes, trees, large spaced-out pieces",
  ],
  [
    "Addressable fairy string (tiny LEDs on copper wire)",
    "2–3 mm LEDs every 5–10 cm on thin enamelled wire",
    "$10–20 per 100",
    "Delicate: the wire kinks and is hard to repair",
    "Easy if used as-is; hard to cut or join. Make sure it says “addressable” or “individually controllable”",
    "Hair, veils, drapes, jars, light sparkle on soft wearables",
  ],
  [
    "Flexible matrix panel (8×8, 16×16, 8×32)",
    "Flexible PCB, about 8–10 mm between pixels; a 16×16 is about 16 cm square",
    "$10–30 per panel",
    "Good on a flat or gently curved surface; repeated folding breaks traces",
    "Easy to wire; needs serious power (a 16×16 can pull 15 A at full white)",
    "Pixel art, scrolling text, backpack and jacket panels",
  ],
  [
    "Rings, jewels and sticks",
    "Small rigid boards: 7-pixel jewels, 12–24 pixel rings, 8-pixel sticks",
    "$3–10 each",
    "Rigid boards hold up well; protect the solder joints",
    "Easy: solder three wires, chain from “out” to the next “in”",
    "Eyes, goggles, badges, gem centres, small props",
  ],
  [
    "Individual pixels (PL9823 5 mm/8 mm, or WS2812B on 10 mm boards)",
    "Single LEDs you place yourself",
    "$0.20–0.50 each",
    "As good as your soldering",
    "Most work: three wires between every pixel",
    "Custom shapes, sparse constellations, anything a strip can’t follow",
  ],
  [
    "Addressable COB / FCOB strip",
    "8–10 mm strip with LEDs packed so close you see a continuous line, no dots",
    "$10–20/m",
    "Same options as WS2812B strip",
    "Easy, but cut points are further apart and many control pixels in groups. Most are 12/24V: check for 5V",
    "Smooth lines without extra diffusion",
  ],
  [
    "Addressable neon flex (strip inside a silicone tube)",
    "8–20 mm silicone profile with the diffusion built in",
    "$10–25/m",
    "Very tough: IP67 silicone",
    "Easy to mount; bends only in one direction (top-bend or side-bend). Most are 12/24V: check for 5V",
    "Neon-style signs, outlines, wearables that need a soft line",
  ],
]

const shopColumns = ["Where", "What it’s good for", "Shipping"]

const shopRows = [
  [
    <a key="ada" href="https://www.adafruit.com/category/168" target="_blank" rel="noreferrer noopener">
      Adafruit
    </a>,
    "Reliable parts with excellent guides; the most expensive",
    "Days (US)",
  ],
  [
    <a key="sf" href="https://www.sparkfun.com/" target="_blank" rel="noreferrer noopener">
      SparkFun
    </a>,
    "Same idea as Adafruit: documented, dependable, pricier",
    "Days (US)",
  ],
  [
    "BTF-Lighting (own store, Amazon, AliExpress)",
    "The best-value reputable strip maker. Clear listings for voltage, density and IP rating",
    "Days on Amazon; 1–3 weeks direct",
  ],
  [
    <a key="ali" href="https://www.aliexpress.us/" target="_blank" rel="noreferrer noopener">
      AliExpress
    </a>,
    "Cheapest for strips, pixels, connectors, silicone wire and diffusion channel. Quality varies by seller",
    "2–4 weeks: order early",
  ],
  ["Amazon", "Fast, but listings are often vague or wrong about the chip and voltage. Read reviews", "1–3 days"],
  [
    <a key="seeed" href="https://www.seeedstudio.com/" target="_blank" rel="noreferrer noopener">
      Seeed Studio
    </a>,
    "The XIAO boards (including the one blinky-time runs on)",
    "1–2 weeks",
  ],
  [
    "DigiKey / Mouser / LCSC",
    "Components: level shifters, capacitors, resistors, fuses, connectors",
    "Days (DigiKey, Mouser); 1–2 weeks (LCSC)",
  ],
]

const LedsSection = () => (
  <GuideSection
    id="leds"
    label="Part 1"
    title="LEDs"
    intro="Everything in this workshop uses addressable LEDs: every pixel can show its own colour, driven by a single data wire from a controller."
  >
    <h3>What to look for in a listing</h3>
    <CardGrid>
      <InfoCard title="Voltage: 5V only">
        <p>
          The listing must say <strong>5V</strong> (sometimes &ldquo;DC5V&rdquo;). WS2815, most WS2811 strips, COB and
          neon flex are often 12V or 24V, and they won&rsquo;t work with what we&rsquo;re building. When in doubt, ask
          me before you buy.
        </p>
      </InfoCard>
      <InfoCard title="Chip">
        <p>
          <strong>WS2812B</strong> (also sold as &ldquo;NeoPixel&rdquo;) is the default and works with every controller
          in this guide. SK6812 (RGBW) and APA102/SK9822 are worth it only if you need what they add.
        </p>
      </InfoCard>
      <InfoCard title="Density (LEDs per metre)">
        <p>
          30/m is cheap, light and easy to power, but you&rsquo;ll see dots. 60/m is the all-rounder. 144/m looks smooth
          but costs more, runs hot and needs a lot more power. More LEDs means more amps, so do the power maths before
          you choose.
        </p>
      </InfoCard>
      <InfoCard title="IP rating (weatherproofing)">
        <p>
          <strong>IP30</strong>: bare strip, indoor and dry. <strong>IP65</strong>: silicone coating on top, fine for
          sweat and splashes. <strong>IP67/68</strong>: sealed in a silicone sleeve or tube, fine outdoors. Silicone
          adds stiffness and makes adhesives harder to use (see Materials).
        </p>
      </InfoCard>
    </CardGrid>

    <h3>Product comparison</h3>
    <p>
      Prices are rough late-2026 figures in USD to help you budget. Budget sellers are the low end; Adafruit and
      SparkFun are the high end.
    </p>
    <DataTable caption="5V addressable LED formats" columns={ledColumns} rows={ledRows} />

    <Callout title="Data has a direction">
      <p>
        Strips and strings have arrows (or <code>DI</code>/<code>DO</code> labels) showing which way data flows. The
        controller connects to the <strong>input</strong> end. Wiring the wrong end is the most common reason a new
        project shows nothing at all.
      </p>
    </Callout>

    <h3>Where to buy</h3>
    <DataTable caption="Suppliers" columns={shopColumns} rows={shopRows} />
    <p>
      Buy about 10% more strip than you measured, and a few spare pixels for repairs. If something is coming from
      overseas, order it as soon as your plan is settled.
    </p>
  </GuideSection>
)

export default LedsSection
