/** Small pixel badge: "PREP 10 MIN", "VEG", "DESSERT · 20 MIN" … */
export default function Badge({ color = 'highlight', className = '', children, title }) {
  return (
    <span
      title={title}
      className={`inline-block font-pixel text-[9px] leading-none text-ink px-3 pt-[10px] pb-2 pixel-frame-sm ${className}`}
      style={{ background: `var(--${color})` }}
    >
      {children}
    </span>
  );
}
