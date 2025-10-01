/** @jsx jsx */
import { Box, Image, jsx } from "theme-ui"

type Props = { src?: string; alt?: string; size?: number | number[] }

export default function AvatarFrame({
  src = "/avatar.jpg",
  alt = "Josh Wentworth headshot",
  size = 256,
}: Props) {
  return (
    <div>
      {/* @ts-ignore */}
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "xl",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "border",
          boxShadow: "softLg", // Longer, softer shadow for professional portrait feel
          backgroundColor: "background",
          "::before": {
            content: '""',
            position: "absolute",
            inset: "-2px",
            borderRadius: "inherit",
            background: (t) => `linear-gradient(120deg, ${t.colors?.accentStart || '#8B5CF6'}, ${t.colors?.accentEnd || '#06B6D4'})`,
            filter: "blur(10px)", // Increased blur for softer falloff
            opacity: 0.30, // Reduced opacity to prevent "glow melt"
            zIndex: -1,
          },
        }}
      >
        {/* @ts-ignore */}
        <Image
          src={src}
          alt={alt}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
    </div>
  )
}
