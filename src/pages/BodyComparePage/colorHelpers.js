export function valueToColor(value, greenMax, yellowMax) {
  if (value <= greenMax) return "#10b981";
  if (value >= yellowMax) {
    const t = Math.min((value - yellowMax) / 15, 1);
    const r = Math.round(251 + (239 - 251) * t);
    const g = Math.round(191 + (68 - 191) * t);
    const b = Math.round(36 + (68 - 36) * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (value - greenMax) / (yellowMax - greenMax);
  const r = Math.round(16 + (251 - 16) * t);
  const g = Math.round(185 + (191 - 185) * t);
  const b = Math.round(129 + (36 - 129) * t);
  return `rgb(${r},${g},${b})`;
}

export function muscleColor(v) {
  if (v >= 42) return "#10b981";
  if (v >= 32) return "#fbbf24";
  return "#ef4444";
}

export function statColor(card, person) {
  if (card.invertColor) return muscleColor(person[card.key]);
  if (card.greenMax != null) return valueToColor(person[card.key], card.greenMax, card.yellowMax);
  return "#22d3ee";
}

export function isDanger(card, person) {
  if (card.dangerMin != null && person[card.key] >= card.dangerMin) return true;
  if (card.dangerMax != null && person[card.key] <= card.dangerMax) return true;
  return false;
}

export function annotColor(annot, person) {
  if (annot.id === "muscles") return muscleColor(person.muscle);
  if (annot.id === "bicep") return "#10b981";
  if (annot.id === "visceral") return "#fbbf24";
  if (annot.id === "skeleton") return "#94a3b8";
  if (annot.id === "subfat") return "#ef4444";
  return "#22d3ee";
}
