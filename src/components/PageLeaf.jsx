/**
 * One sheet of paper turning over the spine, like a real book.
 * Pure CSS keyframes (see "Page turn" in styles/global.css).
 *
 *   side 'R'      sheet sits on the right half, hinged at the spine centre,
 *                 turns right → left (next page)
 *   side 'L'      sheet sits on the left half, hinged at the spine centre,
 *                 turns left → right (previous page)
 *   side 'single' phone view: one page hinged at its left edge;
 *                 dir  1 = current page lifts away to the left
 *                 dir -1 = previous page swings back in from the left
 *
 * front = what the sheet shows before it turns, back = what it shows after.
 */
export default function PageLeaf({ side, dir = 1, front, back, onDone }) {
  const pos =
    side === 'R'
      ? { left: 'calc(50% + 8px)', right: 0 }
      : side === 'L'
        ? { left: 0, right: 'calc(50% + 8px)' }
        : { left: 0, right: 0 };
  const anim = side === 'R' ? 'leaf-next' : side === 'L' ? 'leaf-prev' : dir > 0 ? 'leaf-single-next' : 'leaf-single-prev';
  // the spine side of each face darkens as the sheet stands up, like light falling off a curl
  const spineFront = side === 'L' ? 'to left' : 'to right';
  const spineBack = side === 'L' ? 'to right' : 'to left';

  return (
    <div
      aria-hidden="true"
      className={`leaf ${anim} preserve-3d absolute top-0 bottom-0 z-20`}
      style={{ ...pos, pointerEvents: 'none' }}
      onAnimationEnd={(e) => e.target === e.currentTarget && onDone?.()}
    >
      <div className="backface-hidden absolute inset-0 flex">
        {front}
        <span className="leaf-shade leaf-shade-front" style={{ background: `linear-gradient(${spineFront}, rgba(30,20,30,.45), rgba(30,20,30,.12) 35%, transparent 70%)` }} />
      </div>
      <div className="backface-hidden absolute inset-0 flex" style={{ transform: 'rotateY(180deg)' }}>
        {back}
        <span className="leaf-shade leaf-shade-back" style={{ background: `linear-gradient(${spineBack}, rgba(30,20,30,.45), rgba(30,20,30,.12) 35%, transparent 70%)` }} />
      </div>
    </div>
  );
}

/** Plain back of a sheet (phone view, where only one side of the paper is ever seen). */
export function PaperBack() {
  return (
    <div
      className="flex-1 rounded-[12px] bg-paper"
      style={{
        boxShadow: '0 0 0 3px var(--outline)',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 33px, var(--paper-line) 33px 35px)',
        backgroundPosition: '0 70px',
      }}
    />
  );
}
