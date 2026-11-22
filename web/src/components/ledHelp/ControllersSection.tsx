/** @jsx jsx */
import { jsx } from "theme-ui"
import { GuideSection, DataTable, Callout, CardGrid, InfoCard } from "./primitives"

const compareRows = [
  [
    "Remote controller (IR/RF)",
    "$5–10",
    "Plug in, press buttons",
    "Fixed preset patterns",
    "No",
    "A quick win: shelves, simple room or bike lights",
  ],
  [
    "Bluetooth app controller",
    "$8–20",
    "Phone app (quality varies)",
    "Presets, colour pickers; music mode through the phone mic",
    "Through the phone",
    "Simple pieces you want to change from your phone",
  ],
  [
    "WLED on an ESP32",
    "$5–10 board, or $15–40 pre-built",
    "Browser or the WLED phone app, over Wi-Fi",
    "100+ effects, palettes, playlists, schedules, syncing several pieces",
    "With an added microphone",
    "Sculpture, room and installation lighting; wearables near Wi-Fi or with a phone hotspot",
  ],
  [
    "blinky-time",
    "About $16 for the board",
    "Runs on its own; settings from a browser console",
    "Fire, water, plasma and audio-visualiser effects that react to the music",
    "Yes, built in: hears kicks and snares, follows the tempo",
    "Wearables and totems at shows, festivals and parties",
  ],
  [
    "Write your own (Arduino, CircuitPython)",
    "$5–20",
    "Whatever you build",
    "Anything you can code",
    "If you code it",
    "People who want to program: interactive pieces, sensors, games",
  ],
]

const ControllersSection = () => (
  <GuideSection
    id="controllers"
    label="Part 3"
    title="Controllers"
    intro="The controller is the small board that decides what every pixel shows. Choose it by how you want to interact with the piece once it's built."
  >
    <DataTable
      caption="Controller options"
      columns={["Option", "Cost", "How you control it", "What it can do", "Sound reactive", "Best for"]}
      rows={compareRows}
    />

    <h3>Remotes and app controllers</h3>
    <CardGrid>
      <InfoCard title="IR and RF remote controllers">
        <p>
          Small inline boxes, often bundled with strips, with a button remote. Plug the strip&rsquo;s connector in and
          pick a pattern. There&rsquo;s nothing to set up beyond the LED count on some models.
        </p>
        <p>
          <strong>Trade-off:</strong> you get the patterns it ships with. IR remotes need line of sight; RF remotes work
          through fabric, so choose RF for anything worn.
        </p>
      </InfoCard>
      <InfoCard title="Bluetooth app controllers">
        <p>
          Boxes like the SP-series (SP110E and similar) connect to a phone app. You set the chip type (WS2812B), colour
          order and LED count in the app, then choose effects and colours. Many have a music mode that listens through
          the phone.
        </p>
        <p>
          <strong>Trade-off:</strong> cheap and fast, but the apps are hit and miss, the effects can look generic, and
          you can&rsquo;t add your own.
        </p>
      </InfoCard>
    </CardGrid>

    <h3>WLED</h3>
    <p>
      <a href="https://kno.wled.ge/" target="_blank" rel="noreferrer noopener">
        WLED
      </a>{" "}
      is free, open-source firmware for ESP32 boards and the most capable no-code option. You install it from the
      browser at{" "}
      <a href="https://install.wled.me/" target="_blank" rel="noreferrer noopener">
        install.wled.me
      </a>
      , connect to the board&rsquo;s Wi-Fi, and get a full control panel with over a hundred effects, colour palettes,
      presets and playlists, schedules, and syncing between several pieces.
    </p>
    <ul>
      <li>
        <strong>Board:</strong> any ESP32 development board works. Pre-built controllers (QuinLED, GLEDOPTO, Athom) add
        a screw terminal, a fuse and usually a level shifter, which saves wiring.
      </li>
      <li>
        <strong>Network:</strong> WLED is controlled over Wi-Fi. At home it joins your network; elsewhere it makes its
        own access point, or joins your phone&rsquo;s hotspot.
      </li>
      <li>
        <strong>Sound:</strong> sound-reactive effects need a microphone module (such as an INMP441) wired to the board.
      </li>
      <li>
        <strong>Logic level:</strong> ESP32s send 3.3V data. See <a href="#logic-levels">level shifting</a>.
      </li>
    </ul>

    <h3>blinky-time</h3>
    <p>
      blinky-time is my own controller system, built for audio-reactive wearables and totems. It runs on the{" "}
      <a
        href="https://www.seeedstudio.com/Seeed-XIAO-BLE-Sense-nRF52840-p-5253.html"
        target="_blank"
        rel="noreferrer noopener"
      >
        Seeed XIAO nRF52840 Sense
      </a>
      , a board about the size of a thumbnail with a microphone, a motion sensor, Bluetooth and a LiPo charger built in.
      It&rsquo;s what drives my hats, tubes, bucket totems and the lights on my festival cart.
    </p>
    <CardGrid>
      <InfoCard title="What it does">
        <ul>
          <li>
            Particle-based <strong>fire</strong>, falling <strong>water</strong>, and <strong>plasma</strong> (lightning
            tendrils), plus an audio visualiser and colour rotation.
          </li>
          <li>
            <strong>Listens to the music</strong> through the built-in microphone: it fires on kicks and snares (not
            hi-hats) and tracks the tempo, so the effects move with the song, not just the volume.
          </li>
          <li>Runs on its own: no phone, app or Wi-Fi needed during the show.</li>
          <li>Settings and firmware updates from the Blinky Console in Chrome or Edge.</li>
          <li>Battery monitoring with low-battery warnings.</li>
        </ul>
      </InfoCard>
      <InfoCard title="What it needs from your project">
        <ul>
          <li>
            <strong>WS2812B-type LEDs</strong> (GRB or RGB colour order). RGBW (SK6812) and clocked strips (APA102)
            aren&rsquo;t supported.
          </li>
          <li>
            A layout it can map: a <strong>single string</strong> (a line of pixels in any shape) or a{" "}
            <strong>zigzag matrix</strong> (rows or columns that snake back and forth, like a wrapped tube or panel).
          </li>
          <li>
            A 5V supply for the LEDs, and a <a href="#logic-levels">level shifter</a> for long data runs. The board
            sends 3.3V data.
          </li>
          <li>Tell me in your project plan. I set up each board for its layout.</li>
        </ul>
      </InfoCard>
    </CardGrid>
    <p>
      The code is open source:{" "}
      <a href="https://github.com/Jdubz/blinky-firmware" target="_blank" rel="noreferrer noopener">
        firmware
      </a>{" "}
      and{" "}
      <a href="https://github.com/Jdubz/blinky_time" target="_blank" rel="noreferrer noopener">
        tooling and web console
      </a>
      .
    </p>
    <Callout tone="warning" title="Don't flash blinky-time from the Arduino IDE">
      <p>
        Uploading to the nRF52840 with the Arduino IDE&rsquo;s Upload button or <code>arduino-cli upload</code> can
        brick it. Updates go through the{" "}
        <a href="https://blinky-time.joshwentworth.com/#firmware" target="_blank" rel="noreferrer noopener">
          browser updater
        </a>{" "}
        only.
      </p>
    </Callout>

    <h3>Write your own</h3>
    <p>
      If you want to program, an ESP32, RP2040 (Raspberry Pi Pico) or Arduino with the{" "}
      <a href="https://fastled.io/" target="_blank" rel="noreferrer noopener">
        FastLED
      </a>{" "}
      or{" "}
      <a href="https://learn.adafruit.com/adafruit-neopixel-uberguide" target="_blank" rel="noreferrer noopener">
        Adafruit NeoPixel
      </a>{" "}
      library (or CircuitPython) lets you do anything: sensors, buttons, games, interaction. Budget extra time; the
      workshop sessions will focus on getting your hardware working, not on teaching programming from scratch.
    </p>
  </GuideSection>
)

export default ControllersSection
