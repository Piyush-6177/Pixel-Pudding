import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import { createKitchenScene } from '../pixel/scenes/kitchen.js';
import { lampSound } from '../pixel/sounds.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import SoundToggle from '../components/SoundToggle.jsx';
import PixelButton from '../components/PixelButton.jsx';
import useMeta from '../lib/useMeta.js';
import './Landing.css';

const readLamp = () => {
  try {
    return localStorage.getItem('pp-lamp') !== 'off';
  } catch {
    return true;
  }
};

/** "/" : the cozy pixel kitchen with the closed recipe book. */
export default function Landing() {
  useMeta({
    title: 'Pixel Pudding · cozy recipes in a pixel-art kitchen',
    description: 'Open the book for cozy, traditional recipes: Indian home cooking and world comfort food, with a servings scaler and tickable steps.',
    path: '/',
  });
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { chime, audioContext } = useSound();
  const appRef = useRef(null), sceneRef = useRef(null), fadeRef = useRef(null), stageRef = useRef(null), titleRef = useRef(null);
  const scene = useRef(null);
  const [lampOn, setLampOn] = useState(readLamp);
  const [L, setL] = useState(null);
  const [opening, setOpening] = useState(false);

  const rebuild = useCallback(
    (fade) => {
      const s = scene.current;
      if (!s) return;
      if (fade) s.crossfade();
      const tb = titleRef.current.getBoundingClientRect(), ab = appRef.current.getBoundingClientRect();
      setL({ ...s.build({ theme, lampOn, titleBottomPx: tb.bottom - ab.top }) });
    },
    [theme, lampOn],
  );

  // create the scene once
  useEffect(() => {
    scene.current = createKitchenScene({ container: appRef.current, canvas: sceneRef.current, fadeCanvas: fadeRef.current });
    const start = () => {
      rebuild(false);
      scene.current.start();
    };
    (document.fonts?.ready || Promise.resolve()).then(start, start);
    let rz;
    const onResize = () => {
      clearTimeout(rz);
      rz = setTimeout(() => rebuild(false), 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      scene.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // theme or lamp changed → redraw with a crossfade
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    rebuild(true);
  }, [theme, lampOn, rebuild]);

  const toggleLamp = () => {
    const next = !lampOn;
    setLampOn(next);
    try {
      localStorage.setItem('pp-lamp', next ? 'on' : 'off');
    } catch {}
    lampSound(audioContext(), next);
  };

  /* open sequence: cover swings (0.45s) → zoom into pages (0.45s) → crossfade to /book. Click/Esc skips. */
  const timers = useRef([]);
  const go = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    navigate('/book');
  }, [navigate]);
  const openBook = () => {
    if (opening) return;
    chime();
    if (scene.current.reduced) return go();
    setOpening(true);
    scene.current.startOpening();
    const st = stageRef.current;
    timers.current.push(
      setTimeout(() => {
        st.style.transition = 'transform .45s cubic-bezier(.6,0,.9,.4)';
        st.style.transform = 'scale(3.2)';
      }, 450),
      setTimeout(go, 1150),
    );
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && opening) go();
      if (e.key === 'Enter' && !opening && (document.activeElement === document.body || !document.activeElement)) openBook();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening]);

  const logo = `/logo/pixel-pudding-logo-horizontal-${theme === 'dark' ? 'dark' : 'light'}.svg`;

  return (
    <div id="landing" ref={appRef} className={opening ? 'opening' : ''} onClick={() => opening && go()}>
      <div id="stage" ref={stageRef} style={L ? { transformOrigin: `${L.originPx.x}px ${L.originPx.y}px` } : undefined}>
        <canvas ref={sceneRef} aria-hidden="true" />
        <canvas ref={fadeRef} id="fade" aria-hidden="true" />
      </div>

      {L && (
        <>
          <button
            type="button"
            className="hit"
            aria-label="Open the recipe book"
            style={{ left: L.bookPx.x, top: L.bookPx.y, width: L.bookPx.w, height: L.bookPx.h }}
            onPointerEnter={() => scene.current.setHover(true)}
            onPointerLeave={() => scene.current.setHover(false)}
            onFocus={() => scene.current.setHover(true)}
            onBlur={() => scene.current.setHover(false)}
            onClick={(e) => {
              e.stopPropagation();
              openBook();
            }}
          />
          <button
            type="button"
            className="hit"
            aria-label={lampOn ? 'Turn the lamp off' : 'Turn the lamp on'}
            aria-pressed={lampOn}
            title="Click the lamp"
            style={{ left: L.lampPx.x, top: L.lampPx.y, width: L.lampPx.w, height: L.lampPx.h }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLamp();
            }}
          />
        </>
      )}

      <div className="ui title" ref={titleRef}>
        <h1>
          <img src={logo} alt="Pixel Pudding" width="132" height="49" className="pixel logo" />
        </h1>
        <span className="ribbon-wrap">
          <p className="ribbon">Cook something cozy.</p>
        </span>
      </div>

      <div className="ui cta" style={L ? { top: L.ctaTopPx } : undefined}>
        <PixelButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            openBook();
          }}
          className="cta-btn"
        >
          <span className="blink" aria-hidden="true">
            ▶
          </span>{' '}
          Open the Book
        </PixelButton>
        <p className="hint">{L?.mob ? 'tap the book to begin' : 'click the book or press Enter'}</p>
      </div>

      <div className="toggles">
        <ThemeToggle />
        <SoundToggle />
      </div>
      {opening && <div className="skip">click or press Esc to skip</div>}
    </div>
  );
}
