import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

/* 11×11 UI icons as text rows. o = outline, y = yellow, Y = orange, w = white, h = heart pink, H = heart light */
export const ICONS = {
  sun: ['.....Y.....', '.Y.......Y.', '....ooo....', '...oyyyo...', '..oyyyyyo..', 'YYoyyyyyoYY', '..oyyyyyo..', '...oyyyo...', '....ooo....', '.Y.......Y.', '.....Y.....'],
  moon: ['....ooo....', '..ooyyo....', '.oyyyo.....', '.oyyo......', 'oyyyo......', 'oyyyo....Y.', 'oyyyyo....o', '.oyyyyoooyo', '.ooyyyyyyo.', '..ooyyyoo..', '....ooo....'],
  soundOff: ['...........', '....oo.....', '...owo.....', 'ooowwo.o.o.', 'owwwwo..o..', 'owwwwo.o.o.', 'ooowwo.....', '...owo.....', '....oo.....', '...........', '...........'],
  soundOn: ['...........', '....oo..o..', '...owo...o.', 'ooowwo.o..o', 'owwwwo..o.o', 'owwwwo.o..o', 'ooowwo...o.', '...owo..o..', '....oo.....', '...........', '...........'],
  heartOff: ['...........', '..oo...oo..', '.owwo.owwo.', 'owwwwowwwwo', 'owwwwwwwwwo', 'owwwwwwwwwo', '.owwwwwwwo.', '..owwwwwo..', '...owwwo...', '....owo....', '.....o.....'],
  heartOn: ['...........', '..oo...oo..', '.oHho.ohho.', 'oHhhhohhhho', 'ohhhhhhhhho', 'ohhhhhhhhho', '.ohhhhhhho.', '..ohhhhho..', '...ohhho...', '....oho....', '.....o.....'],
  hand: ['...oo......', '..owwo.....', '..owwo.....', '..owwoooo..', '..owwwwwwo.', 'o.owwwwwwo.', 'oowwwwwwwo.', '.owwwwwwwo.', '..owwwwwo..', '..ooooooo..', '...........'],
  check: ['...........', '..........o', '.........oo', '........oo.', 'o......oo..', 'oo....oo...', '.oo..oo....', '..oooo.....', '...oo......', '...........', '...........'],
  home: ['.....o.....', '....oyo....', '...oyyyo...', '..oyyyyyo..', '.oyyyyyyyo.', 'ooowwwwwooo', '..owwowwo..', '..owwowwo..', '..owwooow..', '..owwowwo..', '..ooooooo..'],
  arrowL: ['...........', '....o......', '...oo......', '..owo......', '.owwooooooo', 'owwwwwwwwwo', '.owwooooooo', '..owo......', '...oo......', '....o......', '...........'],
  arrowR: ['...........', '......o....', '......oo...', '......owo..', 'oooooooowwo', 'owwwwwwwwwo', 'oooooooowwo', '......owo..', '......oo...', '......o....', '...........'],
};

/** Draws one of the ICONS onto a tiny canvas, crisp at any size (size = CSS px, multiple of 11 looks best). */
export default function PixelIcon({ name, size = 33, className = '', style }) {
  const ref = useRef(null);
  const { theme } = useTheme();
  useEffect(() => {
    const rows = ICONS[name];
    const cv = ref.current;
    if (!cv || !rows) return;
    const c = cv.getContext('2d');
    const cs = getComputedStyle(document.documentElement);
    const col = {
      o: cs.getPropertyValue('--outline').trim() || '#4E3A3E',
      y: '#FFE08A',
      Y: '#F2A64E',
      w: '#FFFAF0',
      h: cs.getPropertyValue('--heart').trim() || '#F07C8A',
      H: '#FFB3BC',
    };
    c.clearRect(0, 0, 11, 11);
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++)
        if (r[x] !== '.') {
          c.fillStyle = col[r[x]];
          c.fillRect(x, y, 1, 1);
        }
    });
  }, [name, theme]);
  return (
    <canvas
      ref={ref}
      width="11"
      height="11"
      aria-hidden="true"
      className={`pixel ${className}`}
      style={{ width: size, height: size, ...style }}
    />
  );
}
