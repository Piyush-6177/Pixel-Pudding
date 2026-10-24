/**
 * Server entry used ONLY by scripts/prerender.mjs at build time.
 * Renders a route to static HTML so search engines get finished pages.
 * Pages are imported eagerly here (no lazy/Suspense) because renderToString
 * cannot wait for lazy chunks.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SoundProvider } from './context/SoundContext.jsx';
import { FavouritesProvider } from './context/FavouritesContext.jsx';
import { MetaContext } from './lib/useMeta.js';
import Landing from './pages/Landing.jsx';
import Book from './pages/Book.jsx';
import RecipePage from './pages/RecipePage.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles/tokens.css';
import './styles/global.css';

export { RECIPES, CATEGORIES } from './lib/recipes.js';
export { Cv } from './pixel/raster.js';
export { dishRaster } from './pixel/sprites/dishes.js';

export function render(url) {
  const meta = {};
  const html = renderToString(
    <MetaContext.Provider value={meta}>
      <StaticRouter location={url}>
        <ThemeProvider>
          <SoundProvider>
            <FavouritesProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/book" element={<Book />} />
                <Route path="/recipe/:slug" element={<RecipePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </FavouritesProvider>
          </SoundProvider>
        </ThemeProvider>
      </StaticRouter>
    </MetaContext.Provider>,
  );
  return { html, meta };
}
