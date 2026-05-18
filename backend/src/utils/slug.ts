export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function randomSuffix(length = 4) {
  return Math.random().toString(36).slice(2, 2 + length);
}