import { useEffect, useContext, createContext } from 'react';

/** On the server, the prerender script provides a collector here; the page's meta is written into it during render. */
export const MetaContext = createContext(null);

const SITE = 'https://pixelpudding.example'; // ← change to your real domain before launch

const setTag = (sel, attrs) => {
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement(attrs.tag || 'meta');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) if (k !== 'tag') el.setAttribute(k, v);
  return el;
};

/**
 * Per-page SEO: <title>, description, canonical, Open Graph, Twitter card,
 * and optional JSON-LD (e.g. schema.org/Recipe).
 */
export default function useMeta({ title, description, path = '/', image, jsonLd }) {
  const collector = useContext(MetaContext);
  if (collector) Object.assign(collector, { title, description, path, image, jsonLd });
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = title;
    setTag('meta[name="description"]', { name: 'description', content: description });
    setTag('link[rel="canonical"]', { tag: 'link', rel: 'canonical', href: SITE + path });
    setTag('meta[property="og:title"]', { property: 'og:title', content: title });
    setTag('meta[property="og:description"]', { property: 'og:description', content: description });
    setTag('meta[property="og:url"]', { property: 'og:url', content: SITE + path });
    setTag('meta[property="og:type"]', { property: 'og:type', content: path.startsWith('/recipe/') ? 'article' : 'website' });
    setTag('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Pixel Pudding' });
    setTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    if (image) {
      setTag('meta[property="og:image"]', { property: 'og:image', content: SITE + image });
      setTag('meta[name="twitter:image"]', { name: 'twitter:image', content: SITE + image });
    }
    let script = document.getElementById('jsonld');
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    } else if (script) script.remove();
  }, [title, description, path, image, jsonLd]);
}

export { SITE };
