import { motion } from 'framer-motion';
import { CATEGORIES, CATEGORY_COLORS } from '../lib/recipes.js';
import { useSound } from '../context/SoundContext.jsx';

/** Coloured bookmark tabs sticking out of the top of the book. Active one pops forward. */
export default function CategoryTabs({ active, onChange }) {
  const { tick } = useSound();
  return (
    <div role="tablist" aria-label="Recipe categories" className="flex items-end gap-1.5 sm:gap-2.5 overflow-x-auto px-3 sm:px-10 pt-3 [scrollbar-width:none]">
      {CATEGORIES.map((cat) => {
        const on = cat === active;
        return (
          <motion.button
            key={cat}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => {
              tick();
              onChange(cat);
            }}
            animate={{ y: on ? 0 : 8, scale: on ? 1 : 0.96 }}
            whileHover={{ y: on ? 0 : 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="relative shrink-0 cursor-pointer border-0 font-pixel text-[8px] sm:text-[9px] leading-none text-ink px-3 sm:px-4 pt-[14px] pb-[16px] rounded-t-[6px]"
            style={{
              background: `var(--${CATEGORY_COLORS[cat]})`,
              boxShadow: `0 -3px 0 0 var(--outline), -3px 0 0 0 var(--outline), 3px 0 0 0 var(--outline)${on ? ', inset 0 3px 0 0 rgba(255,255,255,.35)' : ''}`,
              opacity: on ? 1 : 0.88,
              zIndex: on ? 2 : 1,
            }}
          >
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
