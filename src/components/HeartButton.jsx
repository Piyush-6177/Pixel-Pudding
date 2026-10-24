import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavourites } from '../context/FavouritesContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import PixelIcon from './PixelIcon.jsx';

/** Pixel heart favourite toggle with pop + sparkle burst. */
export default function HeartButton({ slug, size = 40 }) {
  const { isFav, toggleFav } = useFavourites();
  const { pop } = useSound();
  const [burst, setBurst] = useState(0);
  const on = isFav(slug);
  return (
    <span className="relative inline-block">
      <motion.button
        type="button"
        aria-label={on ? 'Remove from favourites' : 'Add to favourites'}
        aria-pressed={on}
        onClick={(e) => {
          e.stopPropagation();
          pop();
          toggleFav(slug);
          if (!on) setBurst((b) => b + 1);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        whileTap={{ scale: 0.85 }}
        animate={{ scale: [1, on ? 1.3 : 1, 1] }}
        transition={{ duration: 0.3 }}
        className="grid place-items-center rounded-full border-0 bg-surface cursor-pointer"
        style={{ width: size, height: size, boxShadow: '0 0 0 3px var(--outline), 3px 3px 0 3px var(--deep)' }}
      >
        <PixelIcon name={on ? 'heartOn' : 'heartOff'} size={22} />
      </motion.button>
      <AnimatePresence>
        {burst > 0 && (
          <motion.span key={burst} className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <motion.span
                key={deg}
                className="absolute left-1/2 top-1/2 h-[5px] w-[5px] bg-highlight"
                style={{ boxShadow: '0 0 0 1px var(--outline)' }}
                initial={{ x: -2, y: -2, scale: 0.6 }}
                animate={{ x: Math.cos((deg * Math.PI) / 180) * 28 - 2, y: Math.sin((deg * Math.PI) / 180) * 28 - 2, scale: 1.2 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
