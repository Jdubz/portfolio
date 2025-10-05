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

const ProjectCard = ({ link, title, children, bg, bgImage }: ProjectCardProps) => {
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
        display: `block`,
        width: `100%`,
        minHeight: ["340px", "380px"],
        boxShadow: `0 10px 30px rgba(0,0,0,0.12)`,
        position: `relative`,
        borderRadius: `16px`,
        overflow: `hidden`,
        textDecoration: `none`,
        cursor: link ? `pointer` : `default`,
        transition: `all 200ms cubic-bezier(.22,.61,.36,1)`,
        "&:hover": link
          ? {
              transform: `translateY(-4px)`,
              boxShadow: `0 14px 40px rgba(0,0,0,0.24)`,
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
          background: bgImage
            ? `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 100%)`
            : `linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.55) 100%)`,
          zIndex: 0,
          pointerEvents: `none`,
        },
      }}
    >
      {bgImage && (
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
      )}
      <div
        sx={{
          position: `absolute`,
          inset: 0,
          p: "24px",
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `space-between`,
          zIndex: 1,
          background: bgImage ? `none` : bg || `none`,
        }}
      >
        <h3
          sx={{
            fontSize: ["28px", "32px"],
            fontWeight: 700,
            lineHeight: 1.2,
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
              fontSize: "16px",
              lineHeight: 1.65,
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
