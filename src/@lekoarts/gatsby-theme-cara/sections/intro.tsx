/** @jsx jsx */
import { Box, Grid, Heading, Text, jsx } from "theme-ui"
import AvatarFrame from "../components/AvatarFrame"
import { Button } from "@/components/ui/button"

// @ts-ignore - Theme UI JSX compatibility issues
const Intro = () => (
  // @ts-ignore
  <Box as="section" sx={{ py: [5, 6, 7], position: "relative" }}>
    {/* Mask background icons behind text to prevent collision */}
    {/* @ts-ignore */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        maskImage: "radial-gradient(220px 140px at 24% 46%, transparent 0, black 60%)",
      }}
    />

    {/* @ts-ignore */}
    <Grid
      gap={[4, 5, 6]}            // 32 / 40 / 48px - tighter spacing
      sx={{
        // Slightly tighter container for balanced composition
        maxWidth: [null, 1080, 1120],
        mx: "auto",
        px: [3, 4, 5],
        // Fixed text + smaller avatar track
        gridTemplateColumns: [
          "1fr",
          "minmax(44ch, 50ch) 260px",
        ],
        alignItems: "start",     // Align to top, not center
      }}
    >
      {/* TEXT COLUMN */}
      {/* @ts-ignore */}
      <Box
        sx={{
          maxWidth: ["100%", "50ch", "50ch"],
          // Kill default bottom-margins stacking on last child
          "& > *:last-child": { mb: 0 },
        }}
      >
        {/* @ts-ignore */}
        <Text
          sx={{
            fontWeight: 700,
            letterSpacing: ".02em",
            textTransform: "uppercase",
            fontSize: 13,
            mb: 2,
          }}
        >
          Software × Hardware × Fabrication
        </Text>

        {/* @ts-ignore */}
        <Heading as="h1" sx={{ variant: "text.heroTitle", mb: [2, 3] }}>
          Josh Wentworth
        </Heading>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.heroSub", mb: 2 }}>
          Senior full-stack and cloud engineer. I design reliable, observable systems and ship polished products—blending React/Angular with TypeScript on the front end, Node.js/Python on the back end, and Kubernetes on GCP.
        </Text>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.heroProof", mb: 3 }}>
          Previously at Fulfil Solutions, I led cloud architecture and partner integrations for robotic grocery fulfillment. I also build electronics/lighting and digital-fabrication projects.
        </Text>

        {/* Compact button group with equal heights */}
        {/* @ts-ignore - Radix Slot type compatibility */}
        <div className="flex gap-2 flex-wrap md:flex-nowrap mb-3 items-center">
          {/* @ts-ignore */}
          <Button asChild size="md" className="min-h-10">
            <a href="#projects">View case studies</a>
          </Button>
          {/* @ts-ignore */}
          <Button asChild variant="outline" size="md" className="min-h-10">
            <a href="#contact">Get in touch</a>
          </Button>
        </div>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.micro", mb: 0, opacity: 0.92 }}>
          React • Angular • TypeScript • Node.js • Python • Kubernetes • GCP • MySQL/Redis • Grafana/Loki/Elastic
        </Text>
      </Box>

      {/* AVATAR COLUMN - smaller and top-aligned */}
      {/* @ts-ignore */}
      <Box
        sx={{
          justifySelf: ["center", "start"],
          pt: ["8px", "6px", "4px"],  // Subtle alignment to headline block
        }}
      >
        <AvatarFrame size={[184, 208, 232]} />
      </Box>
    </Grid>
  </Box>
)

export default Intro
