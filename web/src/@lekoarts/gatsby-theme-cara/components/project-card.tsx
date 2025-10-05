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
      <div sx={{ variant: "cards.projectOverlay" }} />
      <div sx={{ variant: "cards.projectText" }}>
        <h3 sx={{ variant: "text.cardTitle" }}>{title}</h3>
        <div
          sx={{
            mt: 2,
            fontSize: 2,
            color: "white",
            opacity: 0.85,
            maxWidth: "58ch",
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
