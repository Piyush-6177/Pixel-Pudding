import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DishSprite from './DishSprite.jsx';
import Badge from './Badge.jsx';
import PixelButton from './PixelButton.jsx';
import PixelIcon from './PixelIcon.jsx';
import HeartButton from './HeartButton.jsx';
import { totalTime, fmtTime, CATEGORY_COLORS, dietInfo } from '../lib/recipes.js';
import { useSound } from '../context/SoundContext.jsx';

const hoverCapable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Sticker card with a 3D flip.
 *   Front: dish art, name, tag, heart, "tap to flip" hint
 *   Back:  name, ingredient checklist preview, "Recipe →" button
 * Desktop flips on hover, touch flips on tap, keyboard on Enter/Space.
 */
export default function RecipeCard({ recipe, search }) {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const { flip } = useSound();
  const toggle = () => {
    flip();
    setFlipped((f) => !f);
  };
  const open = (e) => {
    e.stopPropagation();
    navigate(`/recipe/${recipe.slug}`, { state: { from: search } });
  };

  return (
    <div
      className="group relative h-[400px] w-[270px] shrink-0 [perspective:1200px]"
      onPointerEnter={() => hoverCapable() && setFlipped(true)}
      onPointerLeave={() => hoverCapable() && setFlipped(false)}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${recipe.name}. ${flipped ? 'Showing ingredients' : 'Press to see ingredients'}`}
        aria-pressed={flipped}
        onClick={() => !hoverCapable() && toggle()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="preserve-3d relative h-full w-full cursor-pointer rounded-[14px] transition-transform ease-in-out"
        style={{ transitionDuration: 'var(--t-flip)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* FRONT */}
        <div className="backface-hidden absolute inset-0 flex flex-col gap-3 rounded-[14px] bg-surface p-4 pixel-frame">
          <div
            className="relative grid place-items-center rounded-[10px] py-4 dither"
            style={{ background: `var(--${CATEGORY_COLORS[recipe.category]})`, boxShadow: '0 0 0 3px var(--outline)' }}
          >
            <DishSprite id={recipe.slug} scale={2} alt={recipe.name} />
            <div className="absolute right-2 top-2">
              <HeartButton slug={recipe.slug} />
            </div>
          </div>
          <h3 className="text-[13px] leading-[1.6] text-text">{recipe.name}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge color={CATEGORY_COLORS[recipe.category]}>
              {recipe.category.toUpperCase()} · {fmtTime(totalTime(recipe)).toUpperCase()}
            </Badge>
            <Badge color={dietInfo(recipe).color} title={recipe.diet}>
              {dietInfo(recipe).label}
            </Badge>
          </div>
          <div className="mt-auto flex items-center gap-2 text-[18px] text-muted">
            <PixelIcon name="hand" size={22} />
            <span>{hoverCapable() ? 'hover to flip' : 'tap to flip'}</span>
          </div>
        </div>

        {/* BACK */}
        <div className="backface-hidden absolute inset-0 flex flex-col gap-3 rounded-[14px] bg-surface p-4 pixel-frame [transform:rotateY(180deg)]">
          <div className="rounded-[10px] px-3 pt-3 pb-2 bg-primary" style={{ boxShadow: '0 0 0 3px var(--outline)' }}>
            <h3 className="text-[11px] leading-[1.6] text-ink">{recipe.name}</h3>
            <p className="font-pixel text-[8px] text-ink opacity-80 mt-1">INGREDIENTS</p>
          </div>
          <ul className="flex flex-col gap-1.5 overflow-hidden text-[19px] leading-[1.15] text-text">
            {recipe.ingredients.slice(0, 6).map((ing, i) => (
              <li key={i} className="flex items-center gap-2 truncate">
                <span className="inline-block h-[14px] w-[14px] shrink-0 bg-surface" style={{ boxShadow: '0 0 0 2px var(--outline)' }} />
                <span className="truncate">{ing.name}</span>
              </li>
            ))}
            {recipe.ingredients.length > 6 && <li className="text-muted">+ {recipe.ingredients.length - 6} more…</li>}
          </ul>
          <div className="mt-auto">
            <motion.div whileTap={{ scale: 0.95 }}>
              <PixelButton color="secondary" onClick={open} className="w-[calc(100%-8px)]">
                Recipe <PixelIcon name="arrowR" size={11} className="inline-block align-middle ml-1" />
              </PixelButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
