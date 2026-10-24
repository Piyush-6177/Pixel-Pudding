/**
 * Pixel-art dish image (public/dishes/<slug>.png, 66×66, made by scripts/dish-photos/build.py).
 *   scale: 1 image pixel → N css px. Keep it a whole number so the pixels stay square.
 */
export default function DishSprite({ id, scale = 2, className = '', alt = '' }) {
  const px = 66 * scale;
  return (
    <img
      src={`/dishes/${id}.png`}
      alt={alt}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      draggable="false"
      className={`pixel block select-none ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
