import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard.jsx';

/**
 * One page of the open book: ruled paper, a heading, up to two cards, a page number.
 * side: 'L' | 'R' | 'single' controls the spine shading and corner curl.
 */
export default function BookPage({ side = 'single', number, heading, recipes, search, empty, still = false, className = '' }) {
  const radius = side === 'L' ? 'rounded-l-[12px] rounded-r-[3px]' : side === 'R' ? 'rounded-r-[12px] rounded-l-[3px]' : 'rounded-[12px]';
  const spine =
    side === 'L'
      ? 'linear-gradient(to left, color-mix(in srgb, var(--outline) 14%, transparent), transparent 28px)'
      : side === 'R' || side === 'single'
        ? 'linear-gradient(to right, color-mix(in srgb, var(--outline) 14%, transparent), transparent 28px)'
        : 'none';
  return (
    <section
      aria-label={`Page ${number}`}
      className={`relative flex min-h-[560px] flex-1 flex-col bg-paper ${radius} ${className}`}
      style={{
        boxShadow: '0 0 0 3px var(--outline)',
        backgroundImage: `${spine}, repeating-linear-gradient(to bottom, transparent 0 33px, var(--paper-line) 33px 35px)`,
        backgroundPosition: '0 0, 0 70px',
      }}
    >
      <p className={`font-pixel text-[10px] text-paper-ink px-7 pt-6 ${side === 'R' ? 'text-right' : ''}`}>{heading}</p>
      <div className="flex flex-1 flex-wrap items-start justify-center gap-6 px-4 pt-4 pb-14">
        {recipes.map((r, i) => (
          <motion.div
            key={r.slug}
            initial={still ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i + (side === 'R' ? 0.16 : 0), duration: 0.35, ease: 'easeOut' }}
          >
            <RecipeCard recipe={r} search={search} />
          </motion.div>
        ))}
        {recipes.length === 0 && empty && <p className="mt-16 text-center text-2xl text-paper-ink">{empty}</p>}
      </div>
      <p className="absolute bottom-4 left-0 right-0 text-center text-[20px] text-paper-ink">— {number} —</p>
      {side !== 'L' && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-9 w-9 rounded-tl-[30px] bg-surface-2"
          style={{ boxShadow: 'inset 3px 3px 0 0 var(--outline)' }}
        />
      )}
    </section>
  );
}
