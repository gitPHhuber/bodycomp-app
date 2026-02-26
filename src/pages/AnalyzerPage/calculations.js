export const calc = {
  // Navy Body Fat Formula (US DoD)
  bodyFatNavy(gender, waist, neck, hip, height) {
    if (gender === "male") {
      return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    }
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  },

  // BMI
  bmi(weight, heightCm) {
    const h = heightCm / 100;
    return weight / (h * h);
  },

  // Basal Metabolic Rate (Mifflin-St Jeor)
  bmr(gender, weight, heightCm, age) {
    const base = 10 * weight + 6.25 * heightCm - 5 * age;
    return gender === "male" ? base + 5 : base - 161;
  },

  // Waist-to-Hip Ratio
  whr(waist, hip) {
    return waist / hip;
  },

  // Fat-Free Mass Index
  ffmi(weight, heightCm, bodyFatPct) {
    const h = heightCm / 100;
    const ffm = weight * (1 - bodyFatPct / 100);
    return ffm / (h * h);
  },

  // Lean body mass
  leanMass(weight, bodyFatPct) {
    return weight * (1 - bodyFatPct / 100);
  },

  // Fat mass
  fatMass(weight, bodyFatPct) {
    return weight * (bodyFatPct / 100);
  },

  // Body type classification
  bodyType(gender, bodyFatPct) {
    if (gender === "male") {
      if (bodyFatPct < 6) return { type: "Экстремально низкий жир", emoji: "⚠️", risk: "high" };
      if (bodyFatPct < 14) return { type: "Атлетическое", emoji: "💪", risk: "low" };
      if (bodyFatPct < 18) return { type: "Подтянутое", emoji: "✅", risk: "low" };
      if (bodyFatPct < 25) return { type: "Среднее", emoji: "📊", risk: "medium" };
      return { type: "Избыточный жир", emoji: "⚡", risk: "high" };
    }
    if (bodyFatPct < 14) return { type: "Экстремально низкий жир", emoji: "⚠️", risk: "high" };
    if (bodyFatPct < 21) return { type: "Атлетическое", emoji: "💪", risk: "low" };
    if (bodyFatPct < 25) return { type: "Подтянутое", emoji: "✅", risk: "low" };
    if (bodyFatPct < 32) return { type: "Среднее", emoji: "📊", risk: "medium" };
    return { type: "Избыточный жир", emoji: "⚡", risk: "high" };
  },

  // Visceral fat risk by WHR
  visceralRisk(gender, whr) {
    if (gender === "male") {
      if (whr < 0.90) return { level: "Низкий", color: "#10b981" };
      if (whr < 0.99) return { level: "Повышенный", color: "#f59e0b" };
      return { level: "Высокий", color: "#ef4444" };
    }
    if (whr < 0.80) return { level: "Низкий", color: "#10b981" };
    if (whr < 0.84) return { level: "Повышенный", color: "#f59e0b" };
    return { level: "Высокий", color: "#ef4444" };
  },

  // Body fat category ranges for gauge
  fatRanges(gender) {
    if (gender === "male") {
      return [
        { label: "Мин.", from: 2, to: 6, color: "#f59e0b" },
        { label: "Атлет", from: 6, to: 14, color: "#10b981" },
        { label: "Норма", from: 14, to: 18, color: "#22d3ee" },
        { label: "Средне", from: 18, to: 25, color: "#f59e0b" },
        { label: "Выше", from: 25, to: 40, color: "#ef4444" },
      ];
    }
    return [
      { label: "Мин.", from: 10, to: 14, color: "#f59e0b" },
      { label: "Атлет", from: 14, to: 21, color: "#10b981" },
      { label: "Норма", from: 21, to: 25, color: "#22d3ee" },
      { label: "Средне", from: 25, to: 32, color: "#f59e0b" },
      { label: "Выше", from: 32, to: 45, color: "#ef4444" },
    ];
  },
};
