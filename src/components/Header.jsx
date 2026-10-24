import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import SoundToggle from './SoundToggle.jsx';
import PixelButton from './PixelButton.jsx';
import PixelIcon from './PixelIcon.jsx';

/** Top bar on the book and recipe pages: logo, Home, theme + sound toggles. */
export default function Header({ backTo, backLabel }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  return (
    <header
      className="flex items-center justify-between gap-3 py-3"
      style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
    >
      <Link to="/" aria-label="Pixel Pudding home" className="shrink-0">
        <img
          src={`/logo/pixel-pudding-logo-horizontal-${theme === 'dark' ? 'dark' : 'light'}.svg`}
          alt="Pixel Pudding"
          width="132"
          height="49"
          className="pixel h-[49px] w-[132px] max-[420px]:h-[33px] max-[420px]:w-[88px]"
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        {backTo ? (
          <PixelButton color="accent" size="sm" onClick={() => navigate(backTo)} className="hidden sm:inline-flex items-center gap-2">
            <PixelIcon name="arrowL" size={11} /> {backLabel}
          </PixelButton>
        ) : null}
        <PixelButton color="highlight" size="sm" onClick={() => navigate('/')} aria-label="Home" className="inline-flex items-center gap-2">
          <PixelIcon name="home" size={11} /> <span className="hidden sm:inline">Home</span>
        </PixelButton>
        <ThemeToggle small />
        <SoundToggle small />
      </div>
    </header>
  );
}
