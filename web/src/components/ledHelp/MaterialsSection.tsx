/** @jsx jsx */
import { jsx } from "theme-ui"
import { GuideSection, DataTable, Callout, CardGrid, InfoCard } from "./primitives"

const diffusionRows = [
  [
    "Opal (white) acrylic or polycarbonate",
    "Rigid sheet and tube",
    "Even, bright glow",
    "Sculpture, signs, lamps. Polycarbonate won’t crack",
  ],
  [
    "Aluminium channel with opal cover",
    "Rigid channel",
    "Clean line; channel also sinks heat",
    "Shelves, frames, straight runs, high density",
  ],
  [
    "Silicone neon channel",
    "Flexible profile you push strip into",
    "Smooth neon-like line",
    "Outlines, curves, wearables",
  ],
  ["Thin white 3D prints (PETG)", "Rigid, any shape", "Good at 0.8–1.5 mm walls", "Custom shapes and enclosures"],
  ["Ripstop nylon, lycra, tulle, organza", "Fabric", "Soft; layers add diffusion", "Costumes, kites, soft sculpture"],
  ["Polyester fibrefill or batting", "Stuffing", "Very soft, cloud-like", "Clouds, plush, inside fabric pieces"],
  ["Paper, Tyvek, rice paper", "Sheet", "Warm and soft; fragile", "Lanterns, indoor pieces"],
  ["Ping-pong balls, hot glue", "Small caps", "Turns each pixel into a glowing dot", "Pixel strings, matrices, props"],
]

const pairingRows = [
  [
    "Bare strip (IP30)",
    "Aluminium channel or 3D-printed channel",
    "Aluminium channel, or a heat-safe surface",
    "Factory tape plus VHB; clips at the ends",
    "Indoor only; bend gently in one plane",
  ],
  [
    "Silicone-coated strip (IP65)",
    "Fabric, channel, or a diffuser at a distance",
    "Gets warmer than bare strip; keep brightness down",
    "VHB on the back (the coating is on top); stitching around it",
    "Fine for wearables; slightly stiffer",
  ],
  [
    "Silicone-sleeved strip (IP67)",
    "The sleeve already softens a little; add a diffuser for more",
    "Traps heat; limit brightness",
    "Tape won’t stick to the sleeve: use clips, ties, sewn channels or silicone adhesive",
    "Tough outdoors; seal cut ends with end caps and silicone",
  ],
  [
    "Pixel strings (bullet nodes)",
    "Ping-pong balls, opal panels, fabric",
    "Low; spaced out",
    "Push through 12 mm holes; hot glue or clips from behind",
    "Very forgiving; strain-relieve the wire",
  ],
  [
    "Flexible matrix",
    "A diffuser sheet 10–20 mm in front, or fabric",
    "High at brightness: needs airflow behind",
    "VHB to a stiff backing; Velcro to fabric",
    "Don’t fold it; curve it gently once",
  ],
  [
    "Rings, jewels, individual pixels",
    "Frosted lenses, 3D prints, resin",
    "Low",
    "Screws, hot glue, E6000, epoxy",
    "Strain-relieve every wire at the solder joint",
  ],
  [
    "Fairy strings",
    "Usually none; jars, tulle or paper",
    "Low",
    "Sew or tie loosely",
    "Fragile; don’t pull on the wire",
  ],
]

const MaterialsSection = () => (
  <GuideSection
    id="materials"
    label="Part 4"
    title="Materials"
    intro="LEDs are the easy part. What they're mounted on, what covers them and how they survive being used decides how the piece looks and how long it lasts."
  >
    <h3>Diffusion</h3>
    <p>
      Bare LEDs read as bright dots. Diffusion spreads each pixel into a glow. Two things control it:{" "}
      <strong>the material</strong> and <strong>the distance</strong> between the LEDs and the diffuser. As a starting
      point, put the diffuser at least as far from the LEDs as the LEDs are from each other (about 17 mm for 60/m
      strip). Closer gives a dotty look, further gives a smooth one but costs brightness. Test a scrap of material in
      front of a lit strip before you commit.
    </p>
    <DataTable caption="Diffusion materials" columns={["Material", "Form", "Look", "Good for"]} rows={diffusionRows} />

    <h3>Everything else to think about</h3>
    <CardGrid>
      <InfoCard title="Support and structure">
        <ul>
          <li>
            <strong>Aluminium channel</strong>: rigid, straight, sinks heat. The best home for strip on anything that
            doesn&rsquo;t bend.
          </li>
          <li>
            <strong>3D prints</strong>: use PETG or ASA. PLA softens at around 55&deg;C, which a hot car or desert sun
            will reach.
          </li>
          <li>
            <strong>Foam (EVA, craft foam)</strong>: light and shapeable for costumes and props, but it insulates, so
            keep dense LEDs off it or leave airflow.
          </li>
          <li>
            <strong>Wire and rod armatures, PVC pipe, plywood</strong> for sculpture. Plan where the controller, battery
            and wires go, and how you get to them later.
          </li>
          <li>
            <strong>Fabric</strong>: sew a channel or sleeve for strip, or use a stiff felt or buckram backing panel.
          </li>
        </ul>
      </InfoCard>
      <InfoCard title="Heat">
        <ul>
          <li>
            Each pixel can turn about 0.3 W into heat at full white. 144/m strip at full brightness gets too hot to
            touch.
          </li>
          <li>Metal (aluminium channel, a metal frame) carries heat away; foam, fabric and sealed tubes trap it.</li>
          <li>A brightness limit is the simplest cooling there is.</li>
          <li>Batteries and controllers dislike heat too. Don&rsquo;t bury them next to dense LEDs.</li>
        </ul>
      </InfoCard>
      <InfoCard title="Adhesion and fastening">
        <ul>
          <li>
            The tape on the back of strips is weak. Clean the surface with isopropyl alcohol and add{" "}
            <strong>3M VHB</strong> tape for anything that matters.
          </li>
          <li>
            <strong>Nothing sticks to silicone</strong> except silicone adhesive. On silicone-sleeved strip, use
            mounting clips, zip ties, sewn loops or silicone sealant.
          </li>
          <li>
            <strong>E6000</strong> (flexible, for fabric, vinyl and wearables) and <strong>two-part epoxy</strong>{" "}
            (rigid, for hard parts) are the workhorses. Both need a day to cure.
          </li>
          <li>
            <strong>Hot glue</strong> is fast and good for strain relief, but lets go when warm, so don&rsquo;t trust it
            in the sun.
          </li>
          <li>
            <strong>Velcro and snaps</strong> let you take electronics off a costume for washing and charging.
          </li>
        </ul>
      </InfoCard>
      <InfoCard title="Flexibility and strain relief">
        <ul>
          <li>
            Strip bends in one direction, along its face. It doesn&rsquo;t bend sideways unless you buy
            &ldquo;S-shaped&rdquo; (zigzag) strip.
          </li>
          <li>Never bend at a component or a solder joint. Those are where it breaks.</li>
          <li>
            On wearables, put flexible <strong>silicone wire</strong> across joints like elbows and knees, not strip,
            and keep strip on parts of the body that don&rsquo;t fold.
          </li>
          <li>
            <strong>Strain-relieve every solder joint</strong>: heat shrink over the joint, plus hot glue or a zip tie
            so the wire pulls on the strip, not the pad.
          </li>
          <li>
            Use <strong>connectors</strong> (JST SM 3-pin for data runs, JST PH or XT30 for batteries) at every point
            you might need to separate.
          </li>
        </ul>
      </InfoCard>
      <InfoCard title="Weather and sweat">
        <ul>
          <li>
            Match the IP rating to where it lives: IP30 indoors, IP65 for sweat and splashes, IP67 for rain and dust.
          </li>
          <li>Seal cut ends with silicone end caps and silicone sealant, or adhesive-lined heat shrink.</li>
          <li>Coat exposed solder joints with conformal coating or a dab of silicone.</li>
          <li>Playa or desert dust gets into everything: seal the controller and battery in a box or bag.</li>
        </ul>
      </InfoCard>
      <InfoCard title="Wire, connectors and tools">
        <ul>
          <li>Silicone stranded wire: 22–26 AWG for data, 18–22 AWG for power (see the gauge table).</li>
          <li>Heat shrink in several sizes, including adhesive-lined.</li>
          <li>A temperature-controlled soldering iron, flux, and leaded or good lead-free solder.</li>
          <li>A multimeter: for checking polarity, voltage at the end of a run and shorts before you power on.</li>
        </ul>
      </InfoCard>
    </CardGrid>

    <h3>Matching materials to LED types</h3>
    <DataTable
      caption="What works with what"
      columns={["LED type", "Diffusion", "Heat", "Mounting and adhesion", "Flexibility"]}
      rows={pairingRows}
    />

    <Callout title="Build a test piece first">
      <p>
        Before you build the whole thing, light a short length of your actual LEDs behind your actual diffuser, on your
        actual mounting, at your chosen brightness, for an hour. It answers more questions than any guide can.
      </p>
    </Callout>
  </GuideSection>
)

export default MaterialsSection
