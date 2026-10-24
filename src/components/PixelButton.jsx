import { useSound } from '../context/SoundContext.jsx';

/**
 * Chunky pixel button.
 *   color: 'primary' | 'secondary' | 'accent' | 'highlight' | 'lilac'
 *   size:  'md' | 'sm'
 * Plays a soft chime on click (if sound is on).
 */
export default function PixelButton({ color = 'primary', size = 'md', className = '', onClick, children, ...rest }) {
  const { chime } = useSound();
  return (
    <button
      type="button"
      className={`pbtn ${size === 'sm' ? 'sm' : ''} ${className}`}
      style={{ '--btn': `var(--${color})` }}
      onClick={(e) => {
        chime();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
