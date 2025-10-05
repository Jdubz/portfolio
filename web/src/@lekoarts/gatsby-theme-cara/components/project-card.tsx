/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"

type ProjectCardProps = {
  link?: string
  linkText?: string
  title: string
  children: React.ReactNode
  bg: string
  bgImage?: string
  tags?: string
}

const ProjectCard = ({ link, linkText, title, children, bg, bgImage, tags: _tags }: ProjectCardProps) => {
  return (
    <div
      aria-label={`Project: ${title}`}
      className="card"
      sx={{
        display: `block`,
        width: `100%`,
        minHeight: [`240px`, `260px`, `280px`],
        boxShadow: `elevated`,
        position: `relative`,
        borderRadius: `md`,
        px: [4, 5],
        py: [4, 5],
        color: `white`,
        background: bgImage ? `none` : bg || `none`,
        backgroundImage: bgImage ? `url(${bgImage})` : `none`,
        backgroundSize: `cover`,
        backgroundPosition: `center`,
        overflow: `hidden`,
        "&::before": {
          content: `""`,
          position: `absolute`,
          inset: 0,
          background: bgImage
            ? `radial-gradient(ellipse 120% 90% at 50% 100%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)`
            : `linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.32) 100%)`,
          borderRadius: `md`,
          zIndex: 0,
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
        <div>
          <div
            sx={{
              textTransform: `uppercase`,
              letterSpacing: `wide`,
              fontSize: [4, 5, 6],
              fontWeight: `heading`,
              lineHeight: `heading`,
              color: `white`,
              textShadow: `0 2px 10px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.4)`,
              mb: 3,
            }}
          >
            {title}
          </div>
          <div
            sx={{
              opacity: 0.95,
              textShadow: `0 2px 10px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.4)`,
              p: {
                fontSize: [1, 2],
                color: `white`,
                opacity: 0.9,
                margin: 0,
                lineHeight: 1.6,
              },
            }}
          >
            {children}
          </div>
        </div>
        <div>
          {link && linkText && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              sx={{
                display: `inline-flex`,
                alignItems: `center`,
                gap: 1,
                fontSize: [1, 2],
                color: `white`,
                textDecoration: `none`,
                fontWeight: 600,
                textShadow: `0 2px 10px rgba(0, 0, 0, 0.5)`,
                transition: `all 0.2s ease`,
                "&:hover": {
                  transform: `translateX(4px)`,
                  color: `highlight`,
                },
              }}
            >
              {linkText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
