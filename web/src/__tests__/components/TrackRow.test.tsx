import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import TrackRow, { TrackTile } from "../../components/recordings/TrackRow"
import type { Track } from "../../utils/recordings"

const track: Track = {
  path: "albums/Test/01 Intro.mp3",
  title: "Intro",
  duration: 100,
  peaks: "A/A/",
  number: 1,
  date: "2026-10-06",
  bpm: 120,
  key: "Am",
}

const renderRow = (props: Partial<React.ComponentProps<typeof TrackRow>> = {}) => {
  const onToggle = jest.fn()
  const onSeek = jest.fn()
  render(
    <ul>
      <TrackRow
        track={track}
        active={false}
        playing={false}
        progress={0}
        onToggle={onToggle}
        onSeek={onSeek}
        {...props}
      />
    </ul>
  )
  return { onToggle, onSeek }
}

describe("TrackRow", () => {
  it("shows the title, details and length", () => {
    renderRow()

    expect(screen.getByText("Intro")).toBeInTheDocument()
    expect(screen.getByText("Oct 6, 2026")).toBeInTheDocument()
    expect(screen.getByText("120 BPM")).toBeInTheDocument()
    expect(screen.getByText("Am")).toBeInTheDocument()
    expect(screen.getByText("1:40")).toBeInTheDocument()
  })

  it("toggles playback from the button", () => {
    const { onToggle } = renderRow()

    fireEvent.click(screen.getByRole("button", { name: "Play Intro" }))

    expect(onToggle).toHaveBeenCalledWith(track)
  })

  it("offers pause and shows the position while playing", () => {
    renderRow({ active: true, playing: true, progress: 0.5 })

    expect(screen.getByRole("button", { name: "Pause Intro" })).toBeInTheDocument()
    expect(screen.getByText("0:50")).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Seek Intro" })).toHaveAttribute("aria-valuenow", "50")
  })

  it("says when the track could not be played", () => {
    renderRow({ active: true, failed: true })

    expect(screen.getByRole("alert")).toHaveTextContent("could not be played")
  })

  it("seeks with the arrow keys", () => {
    const { onSeek } = renderRow({ active: true, playing: true, progress: 0.5 })

    const slider = screen.getByRole("slider", { name: "Seek Intro" })

    fireEvent.keyDown(slider, { key: "ArrowRight" })
    expect(onSeek).toHaveBeenLastCalledWith(track, 0.55)

    fireEvent.keyDown(slider, { key: "ArrowDown" })
    expect(onSeek).toHaveBeenLastCalledWith(track, 0.45)
  })

  it("jumps to the start and end with Home and End", () => {
    const { onSeek } = renderRow({ active: true, playing: true, progress: 0.5 })
    const slider = screen.getByRole("slider", { name: "Seek Intro" })

    fireEvent.keyDown(slider, { key: "Home" })
    expect(onSeek).toHaveBeenLastCalledWith(track, 0)

    fireEvent.keyDown(slider, { key: "End" })
    expect(onSeek).toHaveBeenLastCalledWith(track, 1)
  })
})

describe("TrackTile", () => {
  it("plays from the start when pressed", () => {
    const onSeek = jest.fn()
    render(
      <ul>
        <TrackTile track={track} active={false} playing={false} progress={0} onToggle={jest.fn()} onSeek={onSeek} />
      </ul>
    )

    fireEvent.click(screen.getByRole("button", { name: "Play Intro" }))

    expect(onSeek).toHaveBeenCalledWith(track, 0)
    expect(screen.queryByRole("button", { name: "Pause Intro" })).not.toBeInTheDocument()
  })

  it("offers a separate pause while it is playing", () => {
    const onToggle = jest.fn()
    const onSeek = jest.fn()
    render(
      <ul>
        <TrackTile track={track} active playing progress={0.2} onToggle={onToggle} onSeek={onSeek} />
      </ul>
    )

    fireEvent.click(screen.getByRole("button", { name: "Pause Intro" }))

    expect(onToggle).toHaveBeenCalledWith(track)
    expect(onSeek).not.toHaveBeenCalled()
  })

  it("offers resume when paused part-way through", () => {
    render(
      <ul>
        <TrackTile track={track} active playing={false} progress={0.2} onToggle={jest.fn()} onSeek={jest.fn()} />
      </ul>
    )

    expect(screen.getByRole("button", { name: "Resume Intro" })).toBeInTheDocument()
  })
})
