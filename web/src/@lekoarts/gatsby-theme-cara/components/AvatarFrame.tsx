/** @jsx jsx */
import { Box, Image, jsx } from "theme-ui"

type Props = { src?: string; alt?: string; size?: number | number[] }

export default function AvatarFrame({ src = "/avatar.jpg", alt = "Josh Wentworth headshot", size = 256 }: Props) {
  return (
    // @ts-expect-error - Theme UI sx prop type issue
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "xl", // 16px consistent radius
        overflow: "hidden",
        border: "1px solid",
        borderColor: "border",
        boxShadow: "softLg",
        "::before": {
          content: '""',
          position: "absolute",
          inset: "-2px",
          borderRadius: "inherit",
          background: (t) =>
            `linear-gradient(120deg, ${t.colors?.accentStart ?? "#7C3AED"}, ${t.colors?.accentEnd ?? "#06B6D4"})`,
          filter: "blur(7px)", // Even lighter blur for softer ring
          opacity: 0.2, // More subtle
          zIndex: -1,
        },
      }}
    >
      {/* @ts-expect-error - Theme UI sx prop type issue */}
      <Image
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>
  )
}
