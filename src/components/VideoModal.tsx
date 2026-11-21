import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Video } from '../data/projects'

/** A window-styled player for a project demo. Esc, the × or a click outside closes it. */
export function VideoModal({ title, video, onClose }: { title: string; video: Video; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('modal-open')
      opener?.focus()
    }
  }, [])

  return createPortal(
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal" role="dialog" aria-modal="true" aria-label={`${title} demo`} onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <span className="lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>{title} demo</b>
          <button ref={closeBtn} type="button" className="vmodal-close" onClick={onClose} aria-label="Close demo">
            ×
          </button>
        </div>
        {video.kind === 'file' ? (
          <video src={video.src} poster={video.poster} controls autoPlay muted playsInline preload="metadata" />
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&autoplay=1&mute=1`}
            title={`${title} demo`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
        {video.caption && <p className="vmodal-caption">{video.caption}</p>}
      </div>
    </div>,
    document.body,
  )
}
