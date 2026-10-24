import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import DishSprite from '../components/DishSprite.jsx';
import useMeta from '../lib/useMeta.js';

export default function NotFound() {
  useMeta({ title: 'Page not found · Pixel Pudding', description: 'That page fell off the shelf.', path: '/404' });
  return (
    <div className="min-h-full dither">
      <Header />
      <main className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-16 text-center">
        <DishSprite id="chocolate-chip-cookies" scale={5} />
        <h1 className="text-base">404 · crumbs only</h1>
        <p className="text-2xl">That page fell off the shelf. The cat is not telling.</p>
        <Link to="/book" className="pbtn" style={{ '--btn': 'var(--secondary)' }}>
          ◀ Back to the book
        </Link>
      </main>
    </div>
  );
}
