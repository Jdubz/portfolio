import React from "react"
import { render, screen } from "@testing-library/react"
import ButtonLink from "../../components/elements/ButtonLink"

jest.mock("gatsby", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-internal="true" {...rest}>
      {children}
    </a>
  ),
}))

describe("ButtonLink", () => {
  it("renders an internal route as a Gatsby link", () => {
    render(<ButtonLink to="/recordings">Recordings</ButtonLink>)

    const link = screen.getByRole("link", { name: "Recordings" })
    expect(link).toHaveAttribute("href", "/recordings")
    expect(link).toHaveAttribute("data-internal", "true")
  })

  it("renders an address as a plain anchor", () => {
    render(<ButtonLink href="mailto:hello@joshwentworth.com">Email</ButtonLink>)

    const link = screen.getByRole("link", { name: "Email" })
    expect(link).toHaveAttribute("href", "mailto:hello@joshwentworth.com")
    expect(link).not.toHaveAttribute("target")
  })

  it("opens in a new tab safely when asked", () => {
    render(
      <ButtonLink href="https://github.com/Jdubz/portfolio" newTab>
        Repo
      </ButtonLink>
    )

    const link = screen.getByRole("link", { name: "Repo" })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noreferrer noopener")
  })
})
