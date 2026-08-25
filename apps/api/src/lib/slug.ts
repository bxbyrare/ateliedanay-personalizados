export function slugify(name: string): string {
  // NFD-normalize then strip the combining diacritical marks (U+0300-U+036F) it splits
  // off — turns "Caneca Personalizável" into "caneca-personalizavel".
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 140);
}

// `exists` checks whether a candidate slug is already taken (excluding the record
// being updated, if any) — kept generic so both products and categories can reuse this.
export async function uniqueSlugFor(name: string, exists: (candidate: string) => Promise<boolean>): Promise<string> {
  const base = slugify(name) || "item";
  let candidate = base;
  let suffix = 1;
  // Small bounded loop — these catalogs are not large enough for this to matter perf-wise.
  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}
