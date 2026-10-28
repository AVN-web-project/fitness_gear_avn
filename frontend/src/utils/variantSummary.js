/**
 * One-line description of the variant a cart line represents.
 *
 * Shared by the cart page and the mini-cart drawer so the two can never drift apart. The order
 * is colour, size, resistance, weight, pack — the attributes that actually distinguish one
 * variant from another. Empty values are skipped rather than rendered as blanks, and exact
 * repeats are collapsed so the line never reads "Large · Large".
 */
export function variantSummary(item) {
  if (!item) return '';

  const seen = new Set();
  return [item.selectedColor, item.selectedSize, item.resistanceLevel, item.weight, item.selectedPack]
    .map((value) => (typeof value === 'string' ? value.trim() : value))
    .filter((value) => {
      if (value === undefined || value === null || value === '') return false;
      const key = String(value).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(' · ');
}

export default variantSummary;
