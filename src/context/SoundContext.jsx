import { createContext, useContext, useState, useCallback, useRef } from 'react';

const SoundContext = createContext({ muted: true, toggle: () => {}, chime: () => {}, play: () => {} });

/**
 * Tiny 8-bit sound effects made with the Web Audio API (no files needed).
 * Default is MUTED; the user turns sound on with the speaker button.
 */
export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem('pp-muted') !== '0';
    } catch {
      return true;
    }
  });
  const ctxRef = useRef(null);

  const ctx = () => {
    ctxRef.current = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  /** Square-wave blip sequence: [[freqHz, startOffsetSec], …] */
  const play = useCallback(
    (notes, { vol = 0.05, len = 0.18, force = false } = {}) => {
      if (muted && !force) return;
      try {
        const a = ctx();
        const now = a.currentTime;
        notes.forEach(([fq, d]) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.type = 'square';
          o.frequency.value = fq;
          g.gain.setValueAtTime(0, now + d);
          g.gain.linearRampToValueAtTime(vol, now + d + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, now + d + len);
          o.connect(g).connect(a.destination);
          o.start(now + d);
          o.stop(now + d + len + 0.02);
        });
      } catch {}
    },
    [muted],
  );

  const chime = useCallback(() => play([[1318.5, 0], [1975.5, 0.08]]), [play]);
  const flip = useCallback(() => play([[660, 0], [880, 0.05]], { len: 0.1 }), [play]);
  const pop = useCallback(() => play([[523, 0], [784, 0.04], [1046, 0.08]], { len: 0.12 }), [play]);
  const turn = useCallback(() => play([[392, 0], [330, 0.09]], { len: 0.14, vol: 0.035 }), [play]);
  const tick = useCallback(() => play([[988, 0]], { len: 0.08 }), [play]);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem('pp-muted', next ? '1' : '0');
      } catch {}
      return next;
    });
    // confirm with a chime (plays even though state hasn't flipped yet)
    play([[1318.5, 0], [1975.5, 0.08]], { force: true });
  }, [play]);

  return (
    <SoundContext.Provider value={{ muted, toggle, play, chime, flip, pop, turn, tick, audioContext: ctx }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
