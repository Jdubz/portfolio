/** @jsx jsx */
import { Box, Flex, Button, Link, Heading, Text, jsx } from "theme-ui"
import AvatarFrame from "../components/AvatarFrame"

// @ts-ignore - Theme UI JSX compatibility issues
const Intro = () => (
  // @ts-ignore
  <Box sx={{ py: [5, 6, 7], position: "relative" }}>
    {/* Mask background icons behind text to prevent collision */}
    {/* @ts-ignore */}
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        maskImage: "radial-gradient(220px 140px at 20% 46%, rgba(0,0,0,0) 0, rgba(0,0,0,1) 60%)",
      }}
    />

    {/* @ts-ignore */}
    <Flex
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: [3, 4, 5],
        gap: [4, 5, 7],
        alignItems: "center",
        flexDirection: ["column-reverse", "row"],
      }}
    >
      {/* Text column - constrained width for better readability */}
      {/* @ts-ignore */}
      <Box sx={{ flex: "1 1 0", maxWidth: ["100%", "46ch", "52ch"] }}>
        {/* @ts-ignore */}
        <Text sx={{ variant: "text.heroKicker", mb: 2 }}>
          Software × Hardware × Fabrication
        </Text>

        {/* @ts-ignore */}
        <Heading as="h1" sx={{ variant: "text.heroTitle", mb: [2, 3] }}>
          Hi, I'm Josh Wentworth
        </Heading>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.heroSub", mb: 3 }}>
          Senior full-stack and cloud engineer. I design reliable, observable systems and ship polished products—blending TypeScript, React/React Native, Node/Python/Rust, and AWS.
        </Text>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.heroProof", mb: 4 }}>
          Previously at Fulfil Solutions, I led cloud architecture and partner integrations for robotic grocery fulfillment. I also build electronics/lighting and digital-fabrication projects.
        </Text>

        {/* @ts-ignore */}
        <Flex sx={{ gap: 3, flexWrap: "wrap", mb: 3 }}>
          {/* @ts-ignore */}
          <Button as={Link} href="#projects">View case studies</Button>
          {/* @ts-ignore */}
          <Button
            variant="secondary"
            // @ts-ignore
            as={Link}
            href="#contact"
            sx={{ ":focus-visible": { boxShadow: "ring" } }}
          >
            Get in touch
          </Button>
        </Flex>

        {/* @ts-ignore */}
        <Text as="p" sx={{ variant: "text.micro", m: 0 }}>
          TypeScript • React/Native • Node • Python • Rust • AWS • Terraform • SRE
        </Text>
      </Box>

      {/* Avatar */}
      {/* @ts-ignore */}
      <Box sx={{ flex: "0 0 auto" }}>
        <AvatarFrame size={[200, 232, 256]} />
      </Box>
    </Flex>
  </Box>
)

export default Intro
