import { motion } from 'framer-motion';
import PixelIcon from './PixelIcon.jsx';
import { useSound } from '../context/SoundContext.jsx';

/** Numbered pixel speech bubble. Tap to mark the step done. */
export default function StepBubble({ index, text, done, onToggle }) {
  const { tick } = useSound();
  return (
    <motion.li
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className="flex items-start gap-4"
    >
      <button
        type="button"
        aria-pressed={done}
        aria-label={`Step ${index + 1}${done ? ', done' : ''}`}
        onClick={() => {
          tick();
          onToggle();
        }}
        className={`grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 font-pixel text-[12px] text-ink ${done ? 'bg-secondary' : 'bg-primary'}`}
        style={{ boxShadow: '0 0 0 3px var(--outline), 3px 3px 0 3px var(--deep)' }}
      >
        {done ? <PixelIcon name="check" size={22} /> : index + 1}
      </button>
      <button
        type="button"
        onClick={() => {
          tick();
          onToggle();
        }}
        className={`relative flex-1 cursor-pointer rounded-[14px] border-0 bg-surface px-5 pt-3 pb-4 text-left text-[22px] leading-[1.15] ${done ? 'text-muted line-through opacity-75' : 'text-text'}`}
        style={{ boxShadow: '0 0 0 3px var(--outline), 3px 3px 0 3px var(--deep)' }}
      >
        <span aria-hidden="true" className="absolute -left-[9px] top-5 h-3 w-3 rotate-45 bg-surface" style={{ boxShadow: '-3px 3px 0 0 var(--outline)' }} />
        {text}
      </button>
    </motion.li>
  );
}
