/**
 * Recipe data helpers. Recipes live in src/data/*.json; swap or extend freely.
 * Each recipe: { slug, name, category, cuisine, region, diet, spice, prepTime,
 *   cookTime, restTime?, servings, tag, intro, ingredients:[{name, amount, unit, note?}],
 *   steps:[], tips:[], readMore?:[] }
 */
import indian from '../data/recipes-indian.json';
import world from '../data/recipes-world.json';

export const RECIPES = [...indian, ...world];
export const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'];

/** Bookmark colours per category (token names from tokens.css) */
export const CATEGORY_COLORS = {
  All: 'lilac',
  Breakfast: 'highlight',
  Lunch: 'secondary',
  Dinner: 'accent',
  Dessert: 'primary',
  Snacks: 'heart',
};

export const bySlug = (slug) => RECIPES.find((r) => r.slug === slug);

/** Diet label + badge colour. Following Indian labelling, anything with egg counts as non-veg. */
export const DIETS = {
  vegan: { label: 'VEGAN', color: 'secondary' },
  veg: { label: 'VEG', color: 'secondary' },
  egg: { label: 'EGG', color: 'highlight' },
  'non-veg': { label: 'NON-VEG', color: 'heart' },
};
export const dietInfo = (r) => DIETS[r.diet] || DIETS.veg;
export const isNonVeg = (r) => r.diet === 'egg' || r.diet === 'non-veg';
/** Book filter: 'veg' | 'nonveg' | anything else = all */
export const filterByDiet = (list, diet) => (diet === 'veg' ? list.filter((r) => !isNonVeg(r)) : diet === 'nonveg' ? list.filter(isNonVeg) : list);

export const filterByCategory = (cat) => (!cat || cat === 'All' ? RECIPES : RECIPES.filter((r) => r.category === cat));

export const totalTime = (r) => (r.prepTime || 0) + (r.cookTime || 0);

/** "25 min" / "1 h 20 min" */
export const fmtTime = (m) => {
  if (!m) return '0 min';
  const h = Math.floor(m / 60), mm = m % 60;
  return h ? (mm ? `${h} h ${mm} min` : `${h} h`) : `${mm} min`;
};

/** ISO 8601 duration for schema.org: PT1H20M */
export const isoDuration = (m) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return `PT${h ? h + 'H' : ''}${mm ? mm + 'M' : ''}` || 'PT0M';
};

/* ── amounts & scaling ── */
const FRACTIONS = [
  [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.375, '⅜'], [0.5, '½'], [0.625, '⅝'], [0.667, '⅔'], [0.75, '¾'], [0.875, '⅞'],
];
/** 1.5 → "1½", 0.333 → "⅓", 2 → "2", 7.3 g → "7" */
export function fmtAmount(n, unit) {
  if (n == null || n === '') return '';
  if (unit === 'g' || unit === 'ml') return String(Math.round(n));
  if (n >= 10) return String(Math.round(n));
  const whole = Math.floor(n + 1e-9), frac = n - whole;
  if (frac < 0.06) return String(whole);
  let best = null, bd = 1;
  for (const [v, s] of FRACTIONS) if (Math.abs(v - frac) < bd) { bd = Math.abs(v - frac); best = s; }
  if (bd > 0.07) return String(Math.round(n * 10) / 10);
  return whole ? `${whole}${best}` : best;
}

/** Scale all ingredient amounts from the recipe's servings to `servings`. */
export const scaleIngredients = (r, servings) =>
  r.ingredients.map((ing) => ({
    ...ing,
    scaled: typeof ing.amount === 'number' ? (ing.amount * servings) / r.servings : ing.amount,
  }));

/** "1½ cups basmati rice" */
export const ingredientLine = (ing) => {
  const amt = typeof ing.scaled === 'number' ? fmtAmount(ing.scaled, ing.unit) : ing.scaled || '';
  return [amt, ing.unit, ing.name].filter(Boolean).join(' ');
};
