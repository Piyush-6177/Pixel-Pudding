import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FavouritesContext = createContext({ favourites: new Set(), isFav: () => false, toggleFav: () => {} });

/** Pixel hearts. Saved in localStorage as a list of recipe slugs. */
export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem('pp-favs') || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pp-favs', JSON.stringify([...favourites]));
    } catch {}
  }, [favourites]);

  const isFav = useCallback((slug) => favourites.has(slug), [favourites]);
  const toggleFav = useCallback((slug) => {
    setFavourites((s) => {
      const n = new Set(s);
      n.has(slug) ? n.delete(slug) : n.add(slug);
      return n;
    });
  }, []);

  return <FavouritesContext.Provider value={{ favourites, isFav, toggleFav }}>{children}</FavouritesContext.Provider>;
}

export const useFavourites = () => useContext(FavouritesContext);
