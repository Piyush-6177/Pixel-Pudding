import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import DishSprite from '../components/DishSprite.jsx';
import Badge from '../components/Badge.jsx';
import PixelButton from '../components/PixelButton.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import HeartButton from '../components/HeartButton.jsx';
import Checklist from '../components/Checklist.jsx';
import AllergyInfo from '../components/AllergyInfo.jsx';
import StepBubble from '../components/StepBubble.jsx';
import NotFound from './NotFound.jsx';
import { bySlug, scaleIngredients, ingredientLine, fmtTime, totalTime, isoDuration, CATEGORY_COLORS, dietInfo } from '../lib/recipes.js';
import CREDITS from '../data/photo-credits.json';
import useMeta, { SITE } from '../lib/useMeta.js';
import { useSound } from '../context/SoundContext.jsx';

const SPICE = ['MILD', 'GENTLE', 'MEDIUM', 'HOT'];

/** "/recipe/:slug" : the full recipe with servings scaler, tickable ingredients and steps. */
export default function RecipePage() {
  const { slug } = useParams();
  const recipe = bySlug(slug);
  if (!recipe) return <NotFound />;
  return <Recipe recipe={recipe} />;
}

function Recipe({ recipe }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { chime } = useSound();
  const [servings, setServings] = useState(recipe.servings);
  const [checked, setChecked] = useState(() => new Set());
  const [done, setDone] = useState(() => new Set());

  // Back goes to the exact book page + category we came from
  const backTo = useMemo(() => {
    let from = location.state?.from;
    if (!from) {
      try {
        from = sessionStorage.getItem('pp-book') || '';
      } catch {}
    }
    return `/book${from && from !== '?' ? from : ''}`;
  }, [location.state]);

  const ingredients = scaleIngredients(recipe, servings);
  const toggleSet = (setter) => (key) =>
    setter((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.intro,
      image: [`${SITE}/og/${recipe.slug}.png`, `${SITE}/dishes/${recipe.slug}.png`],
      author: { '@type': 'Organization', name: 'Pixel Pudding' },
      recipeCuisine: recipe.cuisine,
      recipeCategory: recipe.category,
      keywords: [recipe.name, recipe.cuisine, recipe.region, recipe.category, 'cozy recipe'].filter(Boolean).join(', '),
      prepTime: isoDuration(recipe.prepTime),
      cookTime: isoDuration(recipe.cookTime),
      totalTime: isoDuration(totalTime(recipe)),
      recipeYield: `${recipe.servings} servings`,
      suitableForDiet: recipe.diet === 'vegan' ? 'https://schema.org/VeganDiet' : recipe.diet === 'veg' ? 'https://schema.org/VegetarianDiet' : undefined,
      recipeIngredient: recipe.ingredients.map((i) => ingredientLine({ ...i, scaled: i.amount })),
      recipeInstructions: recipe.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
    }),
    [recipe],
  );
  useMeta({
    title: `${recipe.name} recipe (${fmtTime(totalTime(recipe))}) · Pixel Pudding`,
    description: recipe.intro,
    path: `/recipe/${recipe.slug}`,
    image: `/og/${recipe.slug}.png`,
    jsonLd,
  });

  const catColor = CATEGORY_COLORS[recipe.category];

  return (
    <motion.div
      className="min-h-full dither bg-bg"
      initial={{ rotateY: 60, opacity: 0, transformOrigin: 'left center' }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ perspective: 1600 }}
    >
      <Header backTo={backTo} backLabel="Back to the book" />
      <main
        className="mx-auto max-w-[1180px] pb-20"
        style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
      >
        <div className="my-4 sm:hidden">
          <PixelButton color="accent" size="sm" onClick={() => navigate(backTo)} className="inline-flex items-center gap-2">
            <PixelIcon name="arrowL" size={11} /> Back to the book
          </PixelButton>
        </div>

        <article className="min-w-0 rounded-[20px] bg-surface p-4 sm:p-8 pixel-frame flex flex-col gap-7">
          {/* hero */}
          <div className="relative grid place-items-center rounded-[14px] py-8 sm:py-12 dither" style={{ background: `var(--${catColor})`, boxShadow: '0 0 0 3px var(--outline)' }}>
            <DishSprite id={recipe.slug} scale={4} alt={`Pixel art of ${recipe.name}`} className="max-[520px]:!h-[198px] max-[520px]:!w-[198px]" />
            <div className="absolute right-4 top-4">
              <HeartButton slug={recipe.slug} size={48} />
            </div>
          </div>

          <PhotoCredit slug={recipe.slug} />

          {/* title block */}
          <div className="flex min-w-0 flex-col items-center gap-4 text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge color={catColor}>{recipe.category.toUpperCase()}</Badge>
              {recipe.region && <Badge color="lilac">{recipe.region.toUpperCase()}</Badge>}
              <Badge color={dietInfo(recipe).color}>{dietInfo(recipe).label}</Badge>
              {recipe.spice > 0 && <Badge color="primary">{'🌶'.repeat(recipe.spice)} {SPICE[recipe.spice]}</Badge>}
            </div>
            <h1 className="text-[18px] sm:text-[26px] leading-[1.5] text-text">{recipe.name}</h1>
            <p className="max-w-[62ch] text-[24px] sm:text-[26px] leading-[1.15] text-muted">{recipe.intro}</p>
            <dl className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <Stat label="PREP" value={fmtTime(recipe.prepTime)} color="primary" />
              <Stat label="COOK" value={fmtTime(recipe.cookTime)} color="secondary" />
              {recipe.restTime ? <Stat label={recipe.restTime >= 240 ? 'SOAK/REST' : 'REST'} value={fmtTime(recipe.restTime)} color="lilac" /> : null}
              <Stat label="SERVES" value={String(servings)} color="accent" />
            </dl>
          </div>

          {/* two columns */}
          <div className="grid min-w-0 gap-8 lg:grid-cols-[420px_1fr]">
            <div className="flex min-w-0 flex-col gap-6 self-start">
            <section aria-labelledby="ing-h" className="flex min-w-0 flex-col gap-5 self-start rounded-[14px] bg-bg p-5" style={{ boxShadow: '0 0 0 3px var(--outline)' }}>
              <h2 id="ing-h" className="text-[14px]">INGREDIENTS</h2>
              <div className="flex items-center justify-between gap-3 rounded-[8px] bg-highlight px-3 py-2" style={{ boxShadow: '0 0 0 3px var(--outline)' }}>
                <PixelButton color="primary" size="sm" aria-label="Fewer servings" onClick={() => setServings((s) => Math.max(1, s - 1))} disabled={servings <= 1}>
                  −
                </PixelButton>
                <span className="font-body text-[26px] text-ink" aria-live="polite">
                  {servings} {servings === 1 ? 'serving' : 'servings'}
                </span>
                <PixelButton color="secondary" size="sm" aria-label="More servings" onClick={() => setServings((s) => Math.min(24, s + 1))} disabled={servings >= 24}>
                  +
                </PixelButton>
              </div>
              <Checklist items={ingredients.map((ing, i) => ({ key: i, label: ingredientLine(ing), note: ing.note }))} checked={checked} onToggle={toggleSet(setChecked)} />
              {servings !== recipe.servings && (
                <button type="button" onClick={() => setServings(recipe.servings)} className="self-start cursor-pointer border-0 bg-transparent p-0 text-[20px] text-muted underline">
                  reset to {recipe.servings} servings
                </button>
              )}
            </section>
            <AllergyInfo allergens={recipe.allergens} />
            </div>

            <section aria-labelledby="steps-h" className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="steps-h" className="text-[14px]">STEPS</h2>
                <span className="text-[20px] text-muted">tap a step to tick it off · {done.size}/{recipe.steps.length}</span>
              </div>
              <ol className="flex flex-col gap-4">
                {recipe.steps.map((s, i) => (
                  <StepBubble key={i} index={i} text={s} done={done.has(i)} onToggle={() => toggleSet(setDone)(i)} />
                ))}
              </ol>
              {done.size === recipe.steps.length && (
                <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[12px] bg-secondary px-5 py-4 text-center font-pixel text-[11px] leading-[1.7] text-ink" style={{ boxShadow: '0 0 0 3px var(--outline)' }}>
                  ★ All done! Enjoy your {recipe.name}. ★
                </motion.p>
              )}
              {recipe.tips?.length > 0 && (
                <div className="rounded-[14px] bg-highlight p-5 flex flex-col gap-3" style={{ boxShadow: '0 0 0 3px var(--outline)' }}>
                  <h3 className="text-[11px] text-ink">KITCHEN NOTES</h3>
                  <ul className="flex flex-col gap-2 text-[22px] leading-[1.15] text-ink">
                    {recipe.tips.map((t, i) => (
                      <li key={i}>▸ {t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recipe.readMore?.length > 0 && (
                <p className="text-[20px] text-muted">
                  Want to go deeper? A good book on this: {recipe.readMore.join('; ')}.
                </p>
              )}
            </section>
          </div>
        </article>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <PixelButton
            color="accent"
            onClick={() => {
              chime();
              navigate(backTo);
            }}
            className="inline-flex items-center gap-2"
          >
            <PixelIcon name="arrowL" size={11} /> Back to the book
          </PixelButton>
          <span className="text-[24px] text-text">Happy cooking!</span>
        </div>
      </main>
    </motion.div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[8px] px-4 pt-3 pb-2 pixel-frame-sm" style={{ background: `var(--${color})` }}>
      <dt className="font-pixel text-[8px] text-ink opacity-80">{label}</dt>
      <dd className="m-0 font-body text-[24px] leading-none text-ink">{value}</dd>
    </div>
  );
}

/** Required credit for the Wikimedia Commons photo the pixel image is made from. */
function PhotoCredit({ slug }) {
  const c = CREDITS[slug];
  if (!c) return null;
  return (
    <p className="-mt-4 text-center text-[17px] leading-tight text-muted">
      Pixel image adapted from{' '}
      <a href={c.page} target="_blank" rel="noopener noreferrer" className="underline">
        a photo by {c.artist || 'a Wikimedia Commons contributor'}
      </a>
      ,{' '}
      <a href={c.licenseUrl || c.page} target="_blank" rel="noopener license noreferrer" className="underline">
        {c.license}
      </a>
      {c.license.includes('SA') ? '. The pixel image is shared under the same licence.' : '.'}
    </p>
  );
}
