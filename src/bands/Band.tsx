import type { ReactNode } from "react";

/**
 * A band is one small-range grid with one editorial job. Bands stack; they
 * do not nest. This wrapper adds the section landmark, a heading, the
 * standfirst, and the hidden props readout — nothing else. The grid inside
 * it is the library's real API, used directly.
 *
 * `kicker` is the small red section label the reference puts over a module
 * ("Top Headlines", "ICYMI"); `title` is the module's own heading. `aside`
 * is a right-hand link in the module head ("See all").
 */
export function Band({
  id, kicker, title, lesson, note, aside, children,
}: {
  id: string;
  kicker?: string;
  title: string;
  lesson?: string;
  note?: string;
  aside?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="band" id={id} aria-labelledby={`${id}-title`}>
      <header className="band__header">
        <div className="band__row">
          <h2 id={`${id}-title`} className="band__title">
            {kicker && <span className="band__kicker">{kicker} </span>}
            {title}
          </h2>
          {aside && <a className="band__aside" href={aside.href}>{aside.label}</a>}
        </div>
        {lesson && <p className="band__lesson">{lesson}</p>}
        {note && <p className="band__note">{note}</p>}
      </header>
      <div className="band__wrap">{children}</div>
    </section>
  );
}
