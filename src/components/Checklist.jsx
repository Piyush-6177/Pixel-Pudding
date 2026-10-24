import { useSound } from '../context/SoundContext.jsx';
import PixelIcon from './PixelIcon.jsx';

/** Tickable ingredient list with pixel checkboxes. `items` = [{ key, label, note }] */
export default function Checklist({ items, checked, onToggle }) {
  const { tick } = useSound();
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it) => {
        const on = checked.has(it.key);
        return (
          <li key={it.key}>
            <label className="flex cursor-pointer items-start gap-3 text-[22px] leading-[1.15]">
              <input
                type="checkbox"
                id={`ing-${it.key}`}
                checked={on}
                onChange={() => {
                  tick();
                  onToggle(it.key);
                }}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-[2px] grid h-[22px] w-[22px] shrink-0 place-items-center ${on ? 'bg-secondary' : 'bg-surface'} peer-focus-visible:outline-4 peer-focus-visible:outline-dashed peer-focus-visible:outline-offset-4`}
                style={{ boxShadow: '0 0 0 3px var(--outline)', outlineColor: 'var(--focus)' }}
              >
                {on && <PixelIcon name="check" size={16} />}
              </span>
              <span className={on ? 'text-muted line-through' : 'text-text'}>
                {it.label}
                {it.note && <span className="text-muted"> ({it.note})</span>}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
