import * as React from "react"
import { objectUrl, type Track } from "../utils/recordings"

export type AudioPlayer = {
  /** Path of the loaded track, playing or paused */
  currentPath: string | null
  playing: boolean
  /** Position in the loaded track, 0 to 1 */
  progress: number
  /** Path of the loaded track if it could not be played */
  failedPath: string | null
  /** Plays or pauses `track`. `queue` is what plays on after it; leave it empty to stop at the end. */
  toggle: (track: Track, queue?: Track[]) => void
  /** Plays `track` from `fraction` (0 to 1) of the way through */
  seek: (track: Track, fraction: number, queue?: Track[]) => void
}

/**
 * One audio element for the whole page, so only one track plays at a time and nothing is
 * downloaded until a track is started.
 */
const useAudioPlayer = (): AudioPlayer => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const trackRef = React.useRef<Track | null>(null)
  const queueRef = React.useRef<Track[]>([])
  const [currentPath, setCurrentPath] = React.useState<string | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [failedPath, setFailedPath] = React.useState<string | null>(null)

  // play() rejects with AbortError when a newer play, pause or track change interrupts it. That is
  // expected; anything else means the track itself could not be played.
  const start = React.useCallback((audio: HTMLAudioElement, path: string) => {
    audio.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError") && trackRef.current?.path === path) {
        setFailedPath(path)
        setPlaying(false)
      }
    })
  }, [])

  const load = React.useCallback(
    (track: Track, queue: Track[], fraction: number) => {
      if (!audioRef.current) {
        const audio = document.createElement("audio")
        audio.preload = "none"
        audio.addEventListener("play", () => setPlaying(true))
        audio.addEventListener("pause", () => setPlaying(false))
        audio.addEventListener("error", () => {
          setFailedPath(trackRef.current?.path ?? null)
          setPlaying(false)
        })
        audio.addEventListener("timeupdate", () => {
          // The published duration covers formats whose own duration the browser cannot read up front
          const duration = Number.isFinite(audio.duration) ? audio.duration : (trackRef.current?.duration ?? 0)
          setProgress(duration > 0 ? Math.min(1, audio.currentTime / duration) : 0)
        })
        audio.addEventListener("ended", () => {
          const queue = queueRef.current
          const position = queue.findIndex((queued) => queued.path === trackRef.current?.path)
          const next = position === -1 ? undefined : queue[position + 1]
          if (next) {
            load(next, queue, 0)
          } else {
            // Not every browser fires "pause" when a track simply runs out
            setPlaying(false)
            setProgress(0)
          }
        })
        audioRef.current = audio
      }

      const audio = audioRef.current
      if (trackRef.current?.path !== track.path) {
        audio.src = objectUrl(track.path)
      }
      trackRef.current = track
      queueRef.current = queue
      audio.currentTime = fraction * track.duration
      setCurrentPath(track.path)
      setProgress(fraction)
      setFailedPath(null)
      start(audio, track.path)
    },
    [start]
  )

  const toggle = React.useCallback(
    (track: Track, queue: Track[] = []) => {
      const audio = audioRef.current
      if (!audio || trackRef.current?.path !== track.path) {
        load(track, queue, 0)
      } else if (audio.paused) {
        setFailedPath(null)
        start(audio, track.path)
      } else {
        audio.pause()
      }
    },
    [load, start]
  )

  const seek = React.useCallback(
    (track: Track, fraction: number, queue: Track[] = []) => load(track, queue, Math.min(1, Math.max(0, fraction))),
    [load]
  )

  React.useEffect(() => () => audioRef.current?.pause(), [])

  return { currentPath, playing, progress, failedPath, toggle, seek }
}

export default useAudioPlayer
