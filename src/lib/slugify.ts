/**
 * Same algorithm as the backend `slugify` util, so the slug preview in the admin form
 * matches exactly what the server will generate.
 * "Men's Shoes & Boots!" -> "mens-shoes-boots"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
