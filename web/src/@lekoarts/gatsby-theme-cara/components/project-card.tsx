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
        minHeight: [280, 340],
        boxShadow: `md`,
        position: `relative`,
        borderRadius: `lg`,
        overflow: `hidden`,
        transition: `all 0.2s ease`,
        "&:hover": {
          transform: `translateY(-4px)`,
          boxShadow: `lg`,
        },
        "&::before": {
          content: `""`,
          position: `absolute`,
          inset: 0,
          background: bgImage
            ? `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 75%)`
            : `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 75%)`,
          zIndex: 0,
          pointerEvents: `none`,
        },
      }}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          sx={{
            position: `absolute`,
            inset: 0,
            width: `100%`,
            height: `100%`,
            objectFit: `cover`,
            zIndex: 0,
          }}
        />
      )}
      <div
        sx={{
          position: `absolute`,
          inset: 0,
          p: [4, 5],
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `flex-end`,
          zIndex: 1,
          background: bgImage ? `none` : bg || `none`,
        }}
      >
        <h3
          sx={{
            variant: `text.h2`,
            color: `white`,
            letterSpacing: `-0.01em`,
            mb: 2,
            textShadow: `0 2px 10px rgba(0, 0, 0, 0.5)`,
          }}
        >
          {title}
        </h3>
        <div
          sx={{
            color: `rgba(255,255,255,0.9)`,
            maxWidth: `60ch`,
            mb: 3,
            p: {
              fontSize: [1, 2],
              lineHeight: 1.6,
              margin: 0,
            },
          }}
        >
          {children}
        </div>
        {link && linkText && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              color: `white`,
              fontWeight: `bold`,
              textDecoration: `none`,
              fontSize: [1, 2],
              transition: `all 0.2s ease`,
              "&:hover": {
                color: `highlight`,
              },
            }}
          >
            {linkText}
          </a>
        )}
      </div>
    </div>
  )
}

export default ProjectCard
