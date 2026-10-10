/**
 * Smaller copies of every picture in images/, so a phone does not download a 1500-pixel
 * photograph for a thumbnail. `scripts/image-sizes.mjs` writes them on every publish as
 * assets/img/<name>-<width>.webp; the browser picks the smallest one that is sharp enough.
 *
 * Only pictures stored in images/ have copies. Anything else (a file just chosen in the
 * panel, an outside address) is shown as it is.
 */
export const IMAGE_WIDTHS = [480, 960, 1500] as const;

const STORED = /^\/images\/([^/?#]+)\.(?:jpe?g|png|webp)$/i;

export function imageSet(src: string, sizes: string): { srcSet?: string; sizes?: string } {
  // The copies exist only in the published site, not on the development server.
  if (!import.meta.env.PROD) return {};
  const match = STORED.exec(src);
  if (!match) return {};
  const name = match[1];
  return {
    srcSet: IMAGE_WIDTHS.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(", "),
    sizes,
  };
}
