import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

/* Each page is its own download, so the recipe page doesn't load the kitchen scene */
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Book = lazy(() => import('./pages/Book.jsx'));
const RecipePage = lazy(() => import('./pages/RecipePage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

/**
 * Routes:
 *   /                     landing (pixel kitchen)
 *   /book?category=&page= the recipe book
 *   /recipe/:slug         one full recipe
 */
export default function App() {
  const location = useLocation();
  return (
    <Suspense fallback={<div className="min-h-full bg-bg" aria-busy="true" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/book" element={<Book />} />
          <Route path="/recipe/:slug" element={<RecipePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
