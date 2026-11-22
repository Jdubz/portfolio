/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import ButtonLink from "../elements/ButtonLink"
import { GuideSection, Callout } from "./primitives"

type Question = { text: string; hint?: string }
type QuestionGroup = { title: string; questions: Question[] }

export const planGroups: QuestionGroup[] = [
  {
    title: "The idea",
    questions: [
      { text: "What are you making, in one or two sentences?" },
      {
        text: "Is it worn, carried, or does it stand or hang somewhere?",
        hint: "Wearable, handheld prop, sculpture, installation, other",
      },
      { text: "Where and when will it be used?", hint: "Name the event and date if there is one" },
      { text: "Indoors or outdoors? Will it face rain, sweat, dust, sun or heat?" },
      { text: "Attach a sketch, photos or reference images of what it should look like lit up." },
    ],
  },
  {
    title: "Size and layout",
    questions: [
      { text: "What are the piece's dimensions, and where on it do the LEDs go?" },
      { text: "Which LED format and density are you using, and why?", hint: "See Part 1" },
      {
        text: "How many LEDs in total? Show how you counted.",
        hint: "Length × LEDs per metre, panel size, number of rings",
      },
      {
        text: "What shape is the layout?",
        hint: "One string, several strings, a zigzag matrix, rings, scattered pixels",
      },
      {
        text: "Draw the data path: where the controller sits, where each strip starts, and the order data travels through them.",
      },
      { text: "Where do the wires run, and how long is each run?" },
    ],
  },
  {
    title: "The look",
    questions: [
      { text: "What should it do? List the effects, colours or moods you want." },
      { text: "Should it react to sound, motion or anything else?" },
      { text: "Visible dots or a smooth glow? Which diffusion material, at what distance from the LEDs?" },
      { text: "How bright does it need to be?", hint: "Night only, or visible in daylight" },
    ],
  },
  {
    title: "Power",
    questions: [
      { text: "Plugged in or portable?" },
      {
        text: "What are your worst-case and typical currents, and what brightness limit did you assume?",
        hint: "Use the power calculator in Part 2",
      },
      {
        text: "Exactly which power source?",
        hint: "Power bank, LiPo with boost, AA pack or wall supply: make, model, capacity and output rating",
      },
      { text: "How long must it run between charges, and does your runtime estimate cover that?" },
      {
        text: "Where does the power source sit, how do you reach it to charge or swap it, and how do you switch it on and off?",
      },
      { text: "Do you need power injection? Where, and with what wire gauge?" },
    ],
  },
  {
    title: "Controller",
    questions: [
      {
        text: "Which controller, and why?",
        hint: "Remote, Bluetooth app, WLED, blinky-time, or your own code (Part 3)",
      },
      {
        text: "How will you change patterns or brightness while it's in use?",
        hint: "Remote, phone, a button, or not at all",
      },
      { text: "Is your controller 3.3V or 5V logic? Do you need a level shifter? How long is the data wire?" },
      { text: "If WLED: will there be Wi-Fi or a phone hotspot where it's used?" },
      { text: "If blinky-time: is your layout one string or a zigzag matrix, and how many pixels per row?" },
    ],
  },
  {
    title: "Materials and build",
    questions: [
      { text: "What's the base or structure, and how do the LEDs attach to it?" },
      { text: "Which adhesives, fasteners or stitching will you use, and do they work with your LEDs' coating?" },
      { text: "Which parts bend, flex or move, and how will you strain-relieve the wiring there?" },
      { text: "How does heat get out? How is it protected from weather or sweat?" },
      { text: "Where are the connectors, so parts can come apart for repair, charging or washing?" },
    ],
  },
  {
    title: "Skills, tools and time",
    questions: [
      { text: "Have you soldered before?" },
      {
        text: "Which tools do you have access to?",
        hint: "Soldering iron, multimeter, 3D printer, sewing machine, power tools",
      },
      { text: "Which part of the build are you least sure about?", hint: "This is where we'll spend our session" },
      { text: "What's your deadline, and how many hours can you put in before then?" },
    ],
  },
  {
    title: "Shopping list and budget",
    questions: [
      { text: "List every part: item, quantity, supplier link, price and shipping time." },
      { text: "What's your total budget, and what does your list cost?" },
      {
        text: "Working back from your first session, when must each order be placed?",
        hint: "Overseas orders take 2–4 weeks",
      },
    ],
  },
]

/** The plan as plain text, for pasting into a document or email and filling in */
export const planAsText = (): string => {
  const lines = ["LED WORKSHOP PROJECT PLAN", "joshwentworth.com/led-help", "", "Name:", "Project title:", ""]
  planGroups.forEach((group, groupIndex) => {
    lines.push(`${groupIndex + 1}. ${group.title.toUpperCase()}`, "")
    group.questions.forEach((question, questionIndex) => {
      lines.push(`${groupIndex + 1}.${questionIndex + 1} ${question.text}`)
      if (question.hint) {
        lines.push(`    (${question.hint})`)
      }
      lines.push("    Answer:", "")
    })
  })
  return lines.join("\n")
}

const ProjectPlan = () => {
  const [status, setStatus] = React.useState<"idle" | "copied" | "failed">("idle")
  const text = planAsText()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
  }

  return (
    <GuideSection
      id="project-plan"
      label="Part 5"
      title="Your project plan"
      intro="Bring me this plan, answered, before the in-person sessions. Once every question has an answer, you'll know exactly what to buy, and have time for it to arrive."
    >
      <Callout title="How to use this">
        <p>
          Copy or download the template, fill it in, and bring it (with your sketch) to me before your first session. If
          a question stumps you, email me at <a href="mailto:hello@joshwentworth.com">hello@joshwentworth.com</a> before
          you order anything, not after.
        </p>
      </Callout>

      <div sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center", mb: 4 }}>
        <button
          type="button"
          onClick={() => void copy()}
          sx={{ variant: "buttons.primary", fontSize: 2, px: 4, py: 2 }}
        >
          Copy plan as text
        </button>
        <ButtonLink
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
          download="led-project-plan.txt"
          variant="secondary"
          styles={{ fontSize: 2, px: 4, py: 2 }}
        >
          Download .txt
        </ButtonLink>
        <span role="status" sx={{ fontSize: 1, color: "textMuted" }}>
          {status === "copied" && "Copied. Paste it into a document and fill it in."}
          {status === "failed" && "Copying isn't available here. Use the download instead."}
        </span>
      </div>

      <ol sx={{ listStyle: "none", "&&": { pl: 0 }, display: "grid", gap: 4 }}>
        {planGroups.map((group, groupIndex) => (
          <li key={group.title} sx={{ variant: "cards.surface", p: [3, 4], "&&": { mb: 0 } }}>
            <h3 sx={{ fontSize: [3, 4], color: "heading", mt: 0, mb: 3 }}>
              <span sx={{ color: "link", mr: 2 }}>{groupIndex + 1}.</span>
              {group.title}
            </h3>
            <ol sx={{ "&&": { pl: 4, mb: 0 } }}>
              {group.questions.map((question, questionIndex) => (
                <li key={question.text} value={questionIndex + 1}>
                  <span sx={{ color: "heading" }}>{question.text}</span>
                  {question.hint && (
                    <span sx={{ display: "block", color: "textMuted", fontSize: 1 }}>{question.hint}</span>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <h3>Bring with you</h3>
      <ul>
        <li>The completed plan, printed or on your phone</li>
        <li>Your sketch, with measurements and the data path drawn on it</li>
        <li>Your shopping list with links, and whatever parts have arrived</li>
        <li>The piece itself, or the base it&rsquo;s being built on, if you can carry it</li>
      </ul>
    </GuideSection>
  )
}

export default ProjectPlan
