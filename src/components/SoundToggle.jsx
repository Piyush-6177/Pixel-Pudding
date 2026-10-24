import { useSound } from '../context/SoundContext.jsx';
import PixelIcon from './PixelIcon.jsx';

/** Speaker toggle. Sound starts muted. */
export default function SoundToggle({ small = false }) {
  const { muted, toggle } = useSound();
  const s = small ? 36 : 48;
  return (
    <button
      type="button"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={!muted}
      className="pixel-frame-sm grid place-items-center cursor-pointer border-0 bg-accent transition-transform duration-300 hover:scale-105 active:translate-y-[3px]"
      style={{ width: s, height: s, transitionTimingFunction: 'var(--ease-spring)' }}
      onClick={toggle}
    >
      <PixelIcon name={muted ? 'soundOff' : 'soundOn'} size={small ? 22 : 33} />
    </button>
  );
}
