/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"

type ProjectCardProps = {
  link?: string
  linkText?: string
  title: string
  children: React.ReactNode
  bgImage: string
  tags?: string
}

const ProjectCard = ({ link, title, children, bgImage }: ProjectCardProps) => {
  const CardWrapper = link ? `a` : `div`
  const cardProps = link
    ? {
        href: link,
        target: "_blank",
        rel: "noreferrer noopener",
      }
    : {}

  return (
    <CardWrapper
      {...cardProps}
      aria-label={`Project: ${title}`}
      className="card"
      sx={{
        variant: "cards.project",
        cursor: link ? `pointer` : `default`,
        "&:hover": link
          ? {
              transform: `translateY(-4px)`,
              boxShadow: `xl`,
            }
          : {},
        "&:active": link
          ? {
              transform: `translateY(-2px)`,
              transition: `all 160ms cubic-bezier(.22,.61,.36,1)`,
            }
          : {},
        "&:focus-visible": link
          ? {
              outline: "3px solid",
              outlineColor: "highlight",
              outlineOffset: "2px",
            }
          : {},
        "&::before": {
          content: `""`,
          position: `absolute`,
          inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0.7) 100%)`,
          zIndex: 1,
          pointerEvents: `none`,
        },
      }}
    >
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        sx={{
          position: `absolute`,
          inset: 0,
          width: `100%`,
          height: `100%`,
          objectFit: `cover`,
          zIndex: 0,
        }}
      />
      <div
        sx={{
          position: `absolute`,
          inset: 0,
          p: "24px",
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `space-between`,
          zIndex: 2,
        }}
      >
        <h3
          sx={{
            fontSize: [5, 6],
            fontWeight: "heading",
            lineHeight: "heading",
            color: `white`,
            letterSpacing: `-0.01em`,
            textShadow: `0 2px 10px rgba(0, 0, 0, 0.5)`,
            mb: 0,
            mt: 2,
          }}
        >
          {title}
        </h3>
        <div
          sx={{
            color: `white`,
            maxWidth: `60ch`,
            p: {
              fontSize: 2,
              lineHeight: "body",
              margin: 0,
              color: "inherit",
            },
          }}
        >
          {children}
        </div>
      </div>
    </CardWrapper>
  )
}

export default ProjectCard
