/**
 * Suggests allergen info for every recipe from its ingredient list.
 *   node scripts/allergens.mjs          → prints a review table
 *   node scripts/allergens.mjs --write  → saves "allergens" into the recipe JSON files
 * Always review the output: this is a starting point, the JSON is the source of truth.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = ['src/data/recipes-indian.json', 'src/data/recipes-world.json'];
// allergen → ingredient-name patterns (lower-case). Order = display order.
const RULES = {
  gluten: [/\b(plain|wholewheat|all-purpose) flour\b/, /sourdough/, /\bdough\b/, /\batta\b/, /\bmaida\b/, /\bbread\b/, /\bpav\b/, /\bpita\b/, /\bnaan\b/, /\bpasta\b/, /tagliatelle|pappardelle/, /ramen noodles/, /semolina|\brava\b|sooji/, /brioche/, /soy sauce/, /\bparatha/],
  milk: [/\bmilk\b(?! powder)(?!.*coconut)/, /milk powder/, /\bcream\b(?!.*coconut)/, /\bbutter\b(?!milk)/, /buttermilk/, /\bghee\b/, /yogurt|yoghurt|\bcurd\b/, /paneer/, /khoya|mawa/, /cheese|cheddar|mozzarella|parmesan|gruy[eè]re|\bfeta\b/],
  egg: [/\beggs?\b/, /\byolks?\b/, /mayonnaise/],
  peanuts: [/peanut/],
  'tree nuts': [/cashew/, /almond/, /pistachio/, /walnut/],
  sesame: [/sesame/, /tahini/],
  soy: [/soy sauce/, /\btofu\b/, /\bmiso\b/],
  fish: [/fish\b/, /fish sauce/, /kingfish|seer|pomfret/],
  mustard: [/mustard/],
  sulphites: [/white wine|\bwine\b/, /raisins?/, /\bsake\b/, /mirin/],
};
// hidden sources in shop-bought ingredients
const CHECK = [
  [/asafoetida|\bhing\b/, 'Hing (asafoetida) is usually blended with wheat flour. Buy a gluten-free one if needed.'],
  [/soy sauce/, 'Soy sauce contains wheat; tamari is a gluten-free swap.'],
  [/curry paste/, 'Ready-made Thai curry paste often contains shrimp paste (shellfish) and fish sauce.'],
  [/pav bhaji masala|sambar powder|garam masala|chaat masala/, 'Ready-made spice blends can contain mustard, wheat or traces of nuts. Check the pack.'],
  [/chocolate|chips/, 'Chocolate often contains milk and soy, and may contain nuts.'],
  [/kombu|dashi|chicken stock|vegetable stock/, 'Stock cubes and ready stocks can contain celery, gluten or soy.'],
  [/ketchup|chilli sauce/, 'Bottled sauces can contain sulphites or gluten.'],
  [/pita|naan|bread|pav|brioche|ramen noodles|noodles/, 'Shop-bought breads and noodles may contain egg, milk, sesame or soy.'],
];
// friendly swaps
const SWAPS = [
  [/\bghee\b/, 'milk', 'Use oil or vegan butter instead of ghee.'],
  [/\bbutter\b(?!milk)/, 'milk', 'Use a plant butter or neutral oil instead of butter.'],
  [/\bcream\b(?!.*coconut)/, 'milk', 'Swap cream for coconut cream or cashew cream.'],
  [/paneer/, 'milk', 'Use firm tofu in place of paneer.'],
  [/yogurt|\bcurd\b/, 'milk', 'Use a plant yogurt (coconut or soy) instead of dairy yogurt.'],
  [/\bmilk\b(?!.*coconut)/, 'milk', 'Oat or soy milk works in place of dairy milk.'],
  [/cheese|cheddar|mozzarella|parmesan|feta/, 'milk', 'Use a dairy-free cheese, or leave it out.'],
  [/khoya|mawa/, 'milk', 'Khoya has no good dairy-free swap; this one is best kept for dairy eaters.'],
  [/cashew|almond|pistachio|walnut/, 'tree nuts', 'Nuts here are a garnish or optional: just leave them out (pumpkin or sunflower seeds add crunch).'],
  [/peanut/, 'peanuts', 'Leave out the peanuts or use roasted chana dal for crunch.'],
  [/(plain|wholewheat|all-purpose) flour|atta|maida/, 'gluten', 'Use a gluten-free flour blend; expect a more delicate texture.'],
  [/semolina|\brava\b|sooji/, 'gluten', 'Use fine rice rava or millet rava instead of semolina.'],
  [/\bpasta\b|tagliatelle|pappardelle/, 'gluten', 'Use gluten-free pasta.'],
  [/ramen noodles/, 'gluten', 'Use rice noodles for a gluten-free bowl.'],
  [/\bpav\b|\bbread\b|\bpita\b|brioche/, 'gluten', 'Serve with gluten-free bread, or rice / rice rotis.'],
  [/soy sauce/, 'gluten', 'Use tamari instead of soy sauce.'],
  [/\beggs?\b/, 'egg', null],
  [/tahini/, 'sesame', 'Use sunflower-seed butter instead of tahini.'],
  [/sesame/, 'sesame', 'Leave out the sesame seeds or oil.'],
  [/mustard/, 'mustard', 'Leave out the mustard (seeds or oil); use cumin seeds or another oil.'],
];

const run = process.argv.includes('--write');
for (const f of FILES) {
  const R = JSON.parse(readFileSync(f, 'utf8'));
  for (const r of R) {
    const contains = new Set(), optional = new Set(), check = new Set(), swaps = new Set();
    for (const ing of r.ingredients) {
      const n = ing.name.toLowerCase(), note = (ing.note || '').toLowerCase();
      // optional when: marked optional, only a serving extra, or the cook has a choice ("ghee or oil", "fish sauce or soy sauce")
      const extra = /optional|to serve/.test(`${n} ${note}`) || /^or\b/.test(note);
      // "A or B": the allergen is only unavoidable if every choice contains it
      const choices = n.split(/\bor\b/);
      for (const [a, pats] of Object.entries(RULES)) {
        const hit = (t) => !(a === 'milk' && /coconut/.test(t)) && pats.some((p) => p.test(t)); // coconut milk is not dairy
        if (!choices.some(hit)) continue;
        (extra || !choices.every(hit) ? optional : contains).add(a);
      }
      for (const [p, t] of CHECK) if (p.test(n)) check.add(t);
      for (const [p, a, t] of SWAPS) if (t && p.test(n) && !(a === 'milk' && /coconut/.test(n))) swaps.add(`${a}|${t}`);
    }
    for (const a of contains) optional.delete(a);
    // milk-solid sweets (khoya, or milk reduced as the base) have no sensible dairy-free swap: keep only the honest note
    const milkBased = r.ingredients.some((i) => /khoya|mawa/.test(i.name.toLowerCase())) || ['rice-kheer', 'mango-kulfi', 'caramel-custard-pudding', 'gajar-halwa'].includes(r.slug);
    for (const sw of [...swaps]) if (milkBased && sw.startsWith('milk|')) swaps.delete(sw);
    if (milkBased) swaps.add('milk|Milk is the heart of this dish, so there is no good dairy-free version.');
    if (contains.has('egg') && !/egg|omelette|bhurji|anda|shakshuka|toast|pudding/.test(r.slug)) swaps.add('egg|For egg-free baking, use 1 tbsp ground flax + 3 tbsp water per egg.');
    r.allergens = { contains: [...contains], optional: [...optional], check: [...check], swaps: [...swaps].map((x) => x.split('|').slice(1).join('|')) };
    if (!run) console.log(`${r.slug.padEnd(30)} C:${[...contains].join(',')}${optional.size ? '  O:' + [...optional].join(',') : ''}`);
  }
  if (run) writeFileSync(f, JSON.stringify(R, null, 2) + '\n');
}
if (run) console.log('written');
