/**
 * Body archetypes — classification based on body fat %, BMI, FFMI, WHR.
 * Used by ArchetypeCard to show personalized result + CTA.
 */

const ARCHETYPES = {
  ultra_lean: {
    id: "ultra_lean",
    emoji: "🔥",
    name: "Ультра-сухой",
    color: "#f59e0b",
    colorDark: "#d97706",
    headline: "Экстремально низкий процент жира",
    description:
      "Ваш уровень подкожного жира ниже физиологической нормы. Такие показатели характерны для соревнующихся атлетов в пиковой форме. Длительное поддержание может влиять на гормональный фон и иммунитет.",
    risk: "Дефицит незаменимых жирных кислот, гормональные нарушения, снижение иммунитета",
    ctaText: "Проверить гормоны и состав тела →",
    ctaSubtext: "DXA покажет распределение жира по зонам и плотность костей",
  },
  athletic: {
    id: "athletic",
    emoji: "💪",
    name: "Атлетик",
    color: "#10b981",
    colorDark: "#059669",
    headline: "Спортивное телосложение",
    description:
      "Отличное соотношение мышечной и жировой ткани. Ваши показатели соответствуют регулярно тренирующимся людям. Это здоровый диапазон с хорошим запасом функциональной массы.",
    risk: "Минимальный. Поддерживайте текущий режим тренировок и питания",
    ctaText: "Узнать точный состав тела →",
    ctaSubtext: "DXA покажет мышечную массу по зонам и выявит асимметрию",
  },
  fit: {
    id: "fit",
    emoji: "✅",
    name: "Подтянутый",
    color: "#22d3ee",
    colorDark: "#0891b2",
    headline: "Хорошая физическая форма",
    description:
      "Процент жира в пределах здоровой нормы. Тело эффективно использует энергию, метаболизм работает стабильно. Есть потенциал для улучшения мышечного рельефа при желании.",
    risk: "Низкий. Следите за балансом питания и физической активностью",
    ctaText: "Получить точную карту тела →",
    ctaSubtext: "DXA-сканирование за 5 минут покажет реальную картину",
  },
  average: {
    id: "average",
    emoji: "📊",
    name: "Среднее телосложение",
    color: "#8b5cf6",
    colorDark: "#7c3aed",
    headline: "Типичные показатели для вашего пола и возраста",
    description:
      "Ваш процент жира находится в среднем диапазоне. Нет критических рисков, но есть пространство для улучшения композиции тела — снижения жировой и увеличения мышечной массы.",
    risk: "Умеренный. Рекомендуется увеличить физическую активность",
    ctaText: "Узнать, где именно жир →",
    ctaSubtext: "DXA покажет висцеральный жир и распределение по зонам",
  },
  overfat: {
    id: "overfat",
    emoji: "⚠️",
    name: "Избыток жира",
    color: "#f97316",
    colorDark: "#ea580c",
    headline: "Повышенный процент жировой ткани",
    description:
      "Уровень жира превышает рекомендуемую норму. Это увеличивает нагрузку на сердечно-сосудистую систему и суставы. Коррекция питания и регулярные тренировки помогут улучшить показатели.",
    risk: "Повышенный риск метаболического синдрома, диабета 2-го типа, сердечно-сосудистых заболеваний",
    ctaText: "Оценить риски точно →",
    ctaSubtext: "DXA измерит висцеральный жир — главный фактор риска",
  },
  obese: {
    id: "obese",
    emoji: "🚨",
    name: "Ожирение",
    color: "#ef4444",
    colorDark: "#dc2626",
    headline: "Критически высокий процент жира",
    description:
      "Показатели указывают на ожирение. Это серьёзный фактор риска для здоровья, требующий внимания специалиста. Рекомендуется комплексная диагностика и план коррекции под наблюдением врача.",
    risk: "Высокий риск: диабет, гипертония, апноэ сна, заболевания суставов, сердечно-сосудистые осложнения",
    ctaText: "Пройти полную диагностику →",
    ctaSubtext: "DXA + консультация специалиста для составления плана",
  },
};

// Thresholds: [upper bound exclusive, archetype key]
const MALE_THRESHOLDS = [
  [8, "ultra_lean"],
  [15, "athletic"],
  [20, "fit"],
  [28, "average"],
  [35, "overfat"],
];

const FEMALE_THRESHOLDS = [
  [16, "ultra_lean"],
  [23, "athletic"],
  [28, "fit"],
  [35, "average"],
  [42, "overfat"],
];

/**
 * Determine body archetype based on composition metrics.
 * @param {Object} params
 * @param {number} params.fatPct - Body fat percentage
 * @param {number} params.bmi - Body mass index
 * @param {number} params.ffmi - Fat-free mass index
 * @param {number} params.whr - Waist-to-hip ratio
 * @param {number} params.age - Age in years
 * @param {string} params.sex - "male" or "female"
 * @returns {Object} Archetype object
 */
export function determineArchetype({ fatPct, bmi, ffmi, whr, age, sex }) {
  const thresholds = sex === "female" ? FEMALE_THRESHOLDS : MALE_THRESHOLDS;

  for (const [upperBound, key] of thresholds) {
    if (fatPct < upperBound) {
      // Special case: low fat but high BMI+FFMI → athletic, not ultra_lean
      if (key === "ultra_lean" && bmi >= 25 && ffmi >= 20) {
        return { ...ARCHETYPES.athletic };
      }
      return { ...ARCHETYPES[key] };
    }
  }

  return { ...ARCHETYPES.obese };
}

export { ARCHETYPES };
