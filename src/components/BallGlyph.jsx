/**
 * A simple volleyball glyph - light fill with three curved seam lines, drawn
 * in currentColor-independent ink/chalk so it reads correctly both on the
 * dark in-app court and on the white printable cheat sheet without a
 * separate print variant.
 */
export default function BallGlyph({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="var(--color-chalk)" stroke="var(--color-ink)" strokeWidth="1.3" />
      <path d="M12 1.5 C 8 6, 8 18, 12 22.5" fill="none" stroke="var(--color-ink)" strokeWidth="1" />
      <path d="M2 9 C 8 12, 16 12, 22 9" fill="none" stroke="var(--color-ink)" strokeWidth="1" />
      <path d="M2 15 C 8 12, 16 12, 22 15" fill="none" stroke="var(--color-ink)" strokeWidth="1" />
    </svg>
  );
}
