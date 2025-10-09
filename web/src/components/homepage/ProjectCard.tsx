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
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [hasBeenViewed, setHasBeenViewed] = React.useState(false)

  // Track project views with Intersection Observer
  React.useEffect(() => {
    if (!cardRef.current || hasBeenViewed) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed) {
            setHasBeenViewed(true)
            // Track project view
            import("../../utils/firebase-analytics")
              .then(({ analyticsEvents }) => {
                analyticsEvents.projectViewed(title)
              })
              .catch(() => {
                // Analytics not critical
              })
          }
        })
      },
      { threshold: 0.5 } // Track when 50% of card is visible
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [title, hasBeenViewed])

  const handleClick = () => {
    // Track project link click
    import("../../utils/firebase-analytics")
      .then(({ analyticsEvents }) => {
        analyticsEvents.projectLinkClicked(title, link ? "external" : "none")
      })
      .catch(() => {
        // Analytics not critical
      })
  }

  const CardWrapper = link ? `a` : `div`
  const cardProps = link
    ? {
        href: link,
        target: "_blank",
        rel: "noreferrer noopener",
        onClick: handleClick,
      }
    : {}

  return (
    <CardWrapper
      {...cardProps}
      // @ts-expect-error - ref type incompatibility between a and div
      ref={cardRef}
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
      <picture>
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
      </picture>
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
