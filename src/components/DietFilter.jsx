import { useSound } from '../context/SoundContext.jsx';

const OPTIONS = [
  { id: 'all', label: 'All', dot: null },
  { id: 'veg', label: 'Veg', dot: '#4F9D5A' },
  { id: 'nonveg', label: 'Non-veg', dot: '#C0392B' },
];

/**
 * Veg / Non-veg switch above the book. Uses the Indian food-label dots
 * (green = veg, red = non-veg). Egg dishes count as non-veg.
 */
export default function DietFilter({ value = 'all', onChange, counts }) {
  const { tick } = useSound();
  return (
    <div role="radiogroup" aria-label="Diet" className="flex items-center gap-2">
      {OPTIONS.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              tick();
              onChange(o.id);
            }}
            className={`flex cursor-pointer items-center gap-2 border-0 px-3 pt-[9px] pb-[7px] font-pixel text-[8px] sm:text-[9px] text-ink transition-transform ${on ? 'bg-highlight -translate-y-[2px]' : 'bg-surface opacity-90'}`}
            style={{ boxShadow: `0 0 0 3px var(--outline)${on ? ', 3px 3px 0 3px var(--deep)' : ''}`, color: on ? 'var(--ink)' : 'var(--text)' }}
          >
            {o.dot && (
              <span aria-hidden="true" className="grid h-[11px] w-[11px] place-items-center bg-paper" style={{ boxShadow: `0 0 0 2px ${o.dot}` }}>
                <span className="h-[5px] w-[5px] rounded-full" style={{ background: o.dot }} />
              </span>
            )}
            {o.label}
            {counts && <span className="opacity-70">{counts[o.id]}</span>}
          </button>
        );
      })}
    </div>
  );
}
