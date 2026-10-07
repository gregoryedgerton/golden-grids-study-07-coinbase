import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "./motion";

/**
 * A ten-second clip in a square. Silent, looping, playing only while it is
 * on screen, and replaced by its still under `prefers-reduced-motion` or the
 * tools panel's reduced-motion switch, which is the mechanism WCAG 2.2.2
 * asks for to stop moving content. `preload="none"` so a page of fifteen
 * clips costs nothing until one scrolls into view.
 */
export function Clip({ src, poster, alt, objectPosition, children }: {
  src: string; poster: string; alt: string; objectPosition?: string; children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <figure className="media">
      {reduced
        ? <img src={poster} alt={alt} style={objectPosition ? { objectPosition } : undefined} />
        : <video ref={ref} className="clip" src={src} poster={poster} muted loop playsInline preload="none" aria-label={alt} style={objectPosition ? { objectPosition } : undefined} />}
      {children}
    </figure>
  );
}

/**
 * The clip, with a control that swaps in the whole film: the Internet
 * Archive's player for the ten, the Commons file itself for Nosferatu. The
 * player loads only when asked for.
 */
export function Player({ clip, poster, alt, title, embed, video }: {
  clip: string; poster: string; alt: string; title: string; embed?: string; video?: string;
}) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <figure className="media media--player">
        {video
          ? <video className="player" src={video} controls autoPlay playsInline aria-label={`${title}, the whole film`} />
          : <iframe className="player" src={embed} title={`${title}, the whole film, on the Internet Archive`} allow="fullscreen" allowFullScreen />}
        <button type="button" className="player__close" onClick={() => setOpen(false)}>Back to the clip</button>
      </figure>
    );
  }
  return (
    <Clip src={clip} poster={poster} alt={alt}>
      <button type="button" className="player__open" onClick={() => setOpen(true)}>
        <span className="player__glyph" aria-hidden="true">▶</span> Play the film
      </button>
    </Clip>
  );
}
