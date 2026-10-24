import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import BookPage from '../components/BookPage.jsx';
import PageLeaf, { PaperBack } from '../components/PageLeaf.jsx';
import PixelButton from '../components/PixelButton.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import { CATEGORIES, filterByCategory, filterByDiet } from '../lib/recipes.js';
import { useFavourites } from '../context/FavouritesContext.jsx';
import { useSound } from '../context/SoundContext.jsx';
import useMeta from '../lib/useMeta.js';

const PER_PAGE = 2;
const useIsWide = () => {
  const [wide, setWide] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1000px)').matches));
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)');
    const fn = (e) => setWide(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return wide;
};

/** "/book?category=&page=" : the open recipe book on the wooden table. */
export default function Book() {
  const [params, setParams] = useSearchParams();
  const wide = useIsWide();
  const { favourites } = useFavourites();
  const { turn } = useSound();

  const category = CATEGORIES.includes(params.get('category')) ? params.get('category') : 'All';
  const showFavs = params.get('category') === 'Favourites';
  const diet = ['veg', 'nonveg'].includes(params.get('diet')) ? params.get('diet') : 'all';
  const inCategory = useMemo(() => (showFavs ? filterByCategory('All').filter((r) => favourites.has(r.slug)) : filterByCategory(category)), [category, showFavs, favourites]);
  const list = useMemo(() => filterByDiet(inCategory, diet), [inCategory, diet]);

  const pagesPerView = wide ? 2 : 1;
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const totalViews = Math.max(1, Math.ceil(totalPages / pagesPerView));
  const view = Math.min(Math.max(1, parseInt(params.get('page') || '1', 10) || 1), totalViews);
  // turning = { dir, from, to } while a sheet is in the air; still = skip card fade-in after a page turn
  const [turning, setTurning] = useState(null);
  const [still, setStill] = useState(false);
  const turnTimer = useRef(0);
  useEffect(() => () => clearTimeout(turnTimer.current), []);

  useMeta({
    title: `${showFavs ? 'Favourites' : category === 'All' ? 'The recipe book' : category + ' recipes'} · Pixel Pudding`,
    description: `Browse ${list.length} cozy ${category === 'All' ? '' : category.toLowerCase() + ' '}recipes in the Pixel Pudding recipe book.`,
    path: `/book${category !== 'All' ? `?category=${category}` : ''}`,
  });

  // remember where we were, so the recipe page can come back here
  useEffect(() => {
    try {
      sessionStorage.setItem('pp-book', `?${params.toString()}`);
    } catch {}
  }, [params]);

  const go = (nextView, nextCat = showFavs ? 'Favourites' : category, nextDiet = diet) => {
    const p = new URLSearchParams();
    if (nextCat !== 'All') p.set('category', nextCat);
    if (nextDiet !== 'all') p.set('diet', nextDiet);
    if (nextView > 1) p.set('page', String(nextView));
    setParams(p);
  };
  const turnTo = (v) => {
    if (v < 1 || v > totalViews || v === view || turning) return;
    turn();
    setStill(true);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTurning({ dir: v > view ? 1 : -1, from: view, to: v });
      clearTimeout(turnTimer.current);
      turnTimer.current = setTimeout(() => setTurning(null), 900); // safety net; normally the sheet's animationend clears it
    }
    go(v);
  };
  const pageRecipes = (pageIdx) => list.slice(pageIdx * PER_PAGE, pageIdx * PER_PAGE + PER_PAGE);
  const heading = showFavs ? '♥ FAVOURITES' : category === 'All' ? 'ALL RECIPES' : category.toUpperCase();
  const search = `?${params.toString()}`;
  const emptyText = showFavs ? 'No favourites yet. Tap a heart on any card.' : diet !== 'all' ? 'No dishes here with this diet filter.' : 'Nothing here yet.';

  /** BookPage props for page index `idx` (0-based) on a given side */
  const pageProps = (idx, side) => ({
    side,
    number: idx + 1,
    heading: side === 'R' ? (idx < totalPages - 1 ? '✦ keep cooking' : '✦ the end') : heading,
    recipes: pageRecipes(idx),
    search,
    empty: side === 'R' ? undefined : emptyText,
    still,
  });
  /** the page(s) visible at a given view number */
  const pagesAt = (v) => {
    const first = (v - 1) * pagesPerView;
    return wide ? [pageProps(first, 'L'), pageProps(first + 1, 'R')] : [pageProps(first, 'single')];
  };
  // plain helper (not a component) so React keeps the same card elements between renders
  const spreadOf = (left, right) => (
    <div className="flex gap-0">
      <BookPage key={`L${left.number}`} {...left} />
      <div aria-hidden="true" className="w-4 shrink-0 bg-cover-dark" style={{ boxShadow: 'inset 0 0 0 3px var(--outline)' }} />
      <BookPage key={`R${right.number}`} {...right} />
    </div>
  );

  /* What's on the table: a resting spread, or a sheet mid-turn over a mixed spread */
  let spread;
  if (turning) {
    const A = pagesAt(turning.from), B = pagesAt(turning.to), next = turning.dir > 0;
    const done = () => {
      clearTimeout(turnTimer.current);
      setTurning(null);
    };
    if (wide) {
      // underneath: the half the sheet hasn't reached yet + the newly revealed half
      spread = (
        <div className="relative">
          {spreadOf(next ? A[0] : B[0], next ? B[1] : A[1])}
          <PageLeaf
            side={next ? 'R' : 'L'}
            front={<BookPage {...(next ? A[1] : A[0])} className="h-full" />}
            back={<BookPage {...(next ? B[0] : B[1])} className="h-full" />}
            onDone={done}
          />
        </div>
      );
    } else {
      spread = (
        <div className="relative flex">
          <BookPage key="under" {...(next ? B[0] : A[0])} />
          <PageLeaf side="single" dir={turning.dir} front={<BookPage {...(next ? A[0] : B[0])} className="h-full" />} back={<PaperBack />} onDone={done} />
        </div>
      );
    }
  } else {
    const P = pagesAt(view);
    spread = wide ? spreadOf(P[0], P[1]) : (
      <div className="flex">
        <BookPage key={`S${P[0].number}`} {...P[0]} />
      </div>
    );
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') turnTo(view + 1);
      if (e.key === 'ArrowLeft') turnTo(view - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <motion.div
      className="min-h-full dither"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background:
          'repeating-linear-gradient(to bottom, var(--wood) 0 44px, var(--wood-dark) 44px 47px), var(--wood)',
      }}
    >
      <Header />
      <main
        className="mx-auto max-w-[1400px] pb-16"
        style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
      >
        <div className="relative z-10 flex items-end justify-between gap-2">
          <CategoryTabs
            active={showFavs ? 'Favourites' : category}
            onChange={(c) => {
              clearTimeout(turnTimer.current);
              setTurning(null);
              setStill(false);
              go(1, c);
            }}
          />
          <button
            type="button"
            onClick={() => {
              clearTimeout(turnTimer.current);
              setTurning(null);
              setStill(false);
              go(1, showFavs ? 'All' : 'Favourites');
            }}
            aria-pressed={showFavs}
            className="mb-[-3px] mr-2 sm:mr-6 shrink-0 cursor-pointer border-0 rounded-t-[6px] bg-heart px-3 pt-3 pb-4 font-pixel text-[8px] sm:text-[9px] text-ink flex items-center gap-2"
            style={{ boxShadow: '0 -3px 0 0 var(--outline), -3px 0 0 0 var(--outline), 3px 0 0 0 var(--outline)', opacity: showFavs ? 1 : 0.88 }}
          >
            <PixelIcon name="heartOn" size={11} /> {favourites.size}
          </button>
        </div>

        {/* leather cover */}
        <div className="relative rounded-[20px] bg-cover p-3 sm:p-5 pixel-frame" style={{ boxShadow: '0 0 0 4px var(--outline), 0 14px 0 0 var(--deep)' }}>
          {/* category changes fade; page changes turn a sheet (see `spread` above) */}
          <motion.div
            key={`${category}-${showFavs}-${diet}-${pagesPerView}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="[perspective:2600px]"
          >
            {spread}
          </motion.div>
          {/* ribbon bookmark */}
          <span aria-hidden="true" className="absolute -bottom-12 right-16 h-16 w-5 bg-heart" style={{ boxShadow: '0 0 0 3px var(--outline)', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)' }} />
        </div>

        {/* pagination */}
        <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <PixelButton color="accent" size="sm" onClick={() => turnTo(view - 1)} disabled={view <= 1} className="inline-flex items-center gap-2">
            <PixelIcon name="arrowL" size={11} /> Prev
          </PixelButton>
          <span className="font-pixel text-[10px] sm:text-[12px] text-text bg-surface px-4 pt-3 pb-[10px] pixel-frame-sm" aria-live="polite">
            Page {view} / {totalViews}
          </span>
          <PixelButton color="accent" size="sm" onClick={() => turnTo(view + 1)} disabled={view >= totalViews} className="inline-flex items-center gap-2">
            Next <PixelIcon name="arrowR" size={11} />
          </PixelButton>
        </nav>
        <p className="mt-3 text-center text-[20px] text-text opacity-85">{wide ? '← → arrow keys turn the page' : 'swipe or tap ◀ ▶ to turn pages'}</p>
      </main>
    </motion.div>
  );
}
