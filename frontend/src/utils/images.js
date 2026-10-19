/**
 * Cloudinary image optimization: inject a width-limited, auto-quality,
 * auto-format transformation into a Cloudinary delivery URL.
 * Non-Cloudinary URLs pass through unchanged.
 */
export function cloudinaryThumb(url, width = 600) {
  if (!url || typeof url !== "string" || !url.includes("/upload/")) return url;
  if (url.includes(`/upload/w_${width},`)) return url; // already transformed
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}
