/** @jsx jsx */
import { jsx } from "theme-ui"

type ProjectCardProps = {
  link: string
  title: string
  children: React.ReactNode
  bg: string
  tags?: string
}

const ProjectCard = ({ link, title, children, bg, tags }: ProjectCardProps) => (
  <a
    href={link}
    target="_blank"
    rel="noreferrer noopener"
    aria-label={`Project: ${title}`}
    className="card"
    sx={{
      display: `block`,
      width: `100%`,
      minHeight: [`220px`, `240px`, `260px`],
      boxShadow: `elevated`,
      position: `relative`,
      textDecoration: `none`,
      borderRadius: `md`,
      px: [4, 5],
      py: [4, 5],
      color: `white`,
      background: bg || `none`,
      transition: `all 0.15s ease`,
      overflow: `hidden`,
      "&::before": {
        content: `""`,
        position: `absolute`,
        inset: 0,
        background: `linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.32) 100%)`,
        borderRadius: `md`,
        zIndex: 0,
      },
      "&:hover, &:focus-visible": {
        color: `white !important`,
        transform: `translateY(-2px)`,
        boxShadow: `hover`,
        textDecoration: `none`,
      },
      "&:focus-visible": {
        outline: `none`,
        boxShadow: `0 0 0 3px rgba(14, 165, 233, 0.45)`,
      },
    }}
  >
    <div
      sx={{
        position: `relative`,
        zIndex: 1,
        height: `100%`,
        display: `flex`,
        flexDirection: `column`,
        justifyContent: `space-between`,
      }}
    >
      <div
        sx={{
          opacity: 0.95,
          textShadow: `0 2px 10px rgba(0, 0, 0, 0.3)`,
          p: {
            fontSize: [1, 2],
            color: `#E6F0F2`,
            margin: 0,
            lineHeight: 1.6,
          },
        }}
      >
        {children}
      </div>
      <div>
        <div
          sx={{
            textTransform: `uppercase`,
            letterSpacing: `wide`,
            pt: 4,
            fontSize: [4, 5, 6],
            fontWeight: `heading`,
            lineHeight: `heading`,
            color: `#FFFFFF`,
          }}
        >
          {title}
        </div>
        {tags && (
          <div
            sx={{
              pt: 2,
              fontSize: 0,
              color: `#E6F0F2`,
              opacity: 0.9,
              letterSpacing: `0.5px`,
            }}
          >
            {tags}
          </div>
        )}
      </div>
    </div>
  </a>
)

export default ProjectCard
