import { A4_ASPECT_RATIO } from '../../config/visualReference'

interface A4PageFrameProps {
  src?: string | null
  alt: string
  emptyText: string
}

export function A4PageFrame({ src, alt, emptyText }: A4PageFrameProps) {
  return (
    <div className="a4-frame" style={{ aspectRatio: A4_ASPECT_RATIO }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <p className="a4-placeholder">{emptyText}</p>
      )}
    </div>
  )
}
