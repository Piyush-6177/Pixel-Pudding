import { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import PixelIcon from './PixelIcon.jsx';

/** Sun ⇄ moon toggle with a little spin. */
export default function ThemeToggle({ small = false }) {
  const { theme, toggle } = useTheme();
  const { chime } = useSound();
  const [spin, setSpin] = useState(false);
  const s = small ? 36 : 48;
  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
      className="pixel-frame-sm grid place-items-center cursor-pointer border-0 bg-highlight transition-transform duration-300 hover:scale-105 active:translate-y-[3px]"
      style={{ width: s, height: s, transitionTimingFunction: 'var(--ease-spring)' }}
      onClick={() => {
        toggle();
        chime();
        setSpin((v) => !v);
      }}
    >
      <PixelIcon
        name={theme === 'dark' ? 'moon' : 'sun'}
        size={small ? 22 : 33}
        style={{ transform: spin ? 'rotate(360deg)' : 'rotate(0deg)', transition: 'transform 400ms var(--ease-spring)' }}
      />
    </button>
  );
}
