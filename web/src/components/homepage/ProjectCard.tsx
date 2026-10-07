/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link as GatsbyLink } from "gatsby"

type ProjectCardProps = {
  link?: string
  linkText?: string
  title: string
  children: React.ReactNode
  bgImage: string
  tags?: string
}

const ProjectCard = ({ link, title, children, bgImage }: ProjectCardProps) => {
  const cardProps = {
    "aria-label": `Project: ${title}`,
    className: "card",
    sx: {
      variant: "cards.project",
      cursor: link ? `pointer` : `default`,
      ...(link && {
        "&:hover": {
          transform: `translateY(-4px)`,
          boxShadow: `xl`,
        },
        "&:active": {
          transform: `translateY(-2px)`,
          transition: `all 160ms cubic-bezier(.22,.61,.36,1)`,
        },
        "&:focus-visible": {
          outline: "3px solid",
          outlineColor: "highlight",
          outlineOffset: "2px",
        },
      }),
    },
  }

  const content = [
    <picture key="image">
      <source
        type="image/webp"
        srcSet={`${bgImage.replace(/\.(png|jpg|jpeg)$/, ".webp")} 1x, ${bgImage.replace(/\.(png|jpg|jpeg)$/, "@2x.webp")} 2x`}
      />
      <img
        src={bgImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        sx={{
          position: `absolute`,
          inset: 0,
          width: `100%`,
          height: `100%`,
          objectFit: `cover`,
          zIndex: 0,
        }}
      />
    </picture>,
    <div key="overlay" sx={{ variant: "cards.projectOverlay" }} />,
    <div key="text" sx={{ variant: "cards.projectText" }}>
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
    </div>,
  ]

  if (!link) {
    return <div {...cardProps}>{content}</div>
  }

  if (link.startsWith("/")) {
    return (
      <GatsbyLink to={link} {...cardProps}>
        {content}
      </GatsbyLink>
    )
  }

  return (
    <a href={link} target="_blank" rel="noreferrer noopener" {...cardProps}>
      {content}
    </a>
  )
}

export default ProjectCard
