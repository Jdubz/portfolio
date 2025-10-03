import * as React from "react"

type ProjectCardProps = {
  link?: string
  title: string
  children: React.ReactNode
  bg: string
  bgImage?: string
  tags?: string
}

const ProjectCard = ({ link, title, children, bg, bgImage, tags }: ProjectCardProps) => {
  const Component = link ? `a` : `div`
  const linkProps = link
    ? {
        href: link,
        target: `_blank`,
        rel: `noreferrer noopener`,
      }
    : {}

  return (
    <Component
      {...linkProps}
      aria-label={`Project: ${title}`}
      className="group relative block rounded-xl overflow-hidden ring-1 ring-black/5 shadow-[0_12px_40px_rgba(2,6,23,.16)] hover:shadow-[0_16px_60px_rgba(2,6,23,.2)] transition-shadow"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : bg,
      }}
    >
      <img src={bgImage} alt="" className="h-full w-full object-cover aspect-[16/9]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
      <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
        <h3 className="text-white font-extrabold text-xl md:text-2xl tracking-[-0.01em]">{title}</h3>
        <p className="hidden md:block mt-1 text-white/80 text-sm max-w-[58ch]">{children}</p>
        {tags && <div className="mt-2 text-xs text-white/70 tracking-wide">{tags}</div>}
      </div>
    </Component>
  )
}

export default ProjectCard
