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

 * Архетипы тела — продвинутая классификация состава тела.
 *
 * Комбинирует fatPct, BMI, FFMI, WHR и возраст для определения
 * одного из 5 архетипов. НЕ заменяет bodyType() из calculations.js.
 *
 * Источники порогов:
 * - WHO (2008): WHR ≥0.90 М / ≥0.80 Ж — повышенный кардиометаболический риск
 * - ACSM: fatPct >20% М / >28% Ж — начало зоны повышенного риска
 *   (WHO определяет ожирение по %жира: >25% М, >35% Ж)
 * - Schutz et al. (2002): FFMI нормы 16.7–19.8 М, 13.0–16.8 Ж
 * - EWGSOP2 (2019): потеря мышечной массы 1-2% в год после 50
 *
 * Приоритет определения (если попадает под несколько):
 *   1. visceral_risk  (самый опасный)
 *   2. skinny_fat     (неожиданный)
 *   3. age_shift      (возрастной)
 *   4. athletic       (позитивный)
 *   5. balanced       (default)
 *
 * Тесты:
 *   М, 30, fatPct=24, bmi=23, whr=0.85, ffmi=16 → skinny_fat
 *   Ж, 35, fatPct=33, bmi=24, whr=0.82, ffmi=14 → visceral_risk
 *   М, 28, fatPct=12, bmi=26, whr=0.82, ffmi=21 → athletic
 *   Ж, 52, fatPct=30, bmi=26, whr=0.78, ffmi=14 → age_shift
 *   М, 25, fatPct=16, bmi=22, whr=0.80, ffmi=17 → balanced
 */

const ARCHETYPES = {
  skinny_fat: {
    id: 'skinny_fat',
    name: 'Скрытый жир при нормальном весе',
    emoji: '🎭',
    color: '#ef4444',
    headline: 'Нормальный вес. Скрытый жир.',
    description:
      'ИМТ в пределах нормы, но процент жира повышен. Весы и зеркало могут не показывать проблему, но внутри тело накапливает жир за счёт потери мышечной массы.',
    risk: 'Повышенный процент жира при нормальном весе связан с метаболическим синдромом, инсулинорезистентностью и кардиоваскулярными рисками.',
    recommendation:
      'Силовые тренировки 2–3 раза в неделю и достаточное потребление белка помогут изменить соотношение мышц и жира.',
    ctaText: 'Узнать точные цифры на DXA',
    ctaSubtext: 'DXA покажет распределение жира по зонам тела с точностью ±1–2%',
  },

  visceral_risk: {
    id: 'visceral_risk',
    name: 'Висцеральный риск',
    emoji: '⚠️',
    color: '#f97316',
    headline: 'Повышенный висцеральный жир — невидимая угроза.',
    description:
      'Высокое соотношение талия/бёдра говорит о накоплении жира вокруг внутренних органов. Этот жир метаболически активен и влияет на гормональный фон и воспалительные процессы.',
    risk: 'Высокое соотношение талия/бёдра указывает на накопление висцерального жира — независимый предиктор диабета 2 типа и сердечно-сосудистых заболеваний.',
    recommendation:
      'Аэробные нагрузки и контроль калорийности наиболее эффективно снижают висцеральный жир.',
    ctaText: 'Измерить висцеральный жир на DXA',
    ctaSubtext: 'DXA точно определит объём висцерального жира и его динамику',
  },

  athletic: {
    id: 'athletic',
    name: 'Атлетическое телосложение',
    emoji: '💪',
    color: '#10b981',
    headline: 'Атлетическое телосложение. ИМТ может ошибаться.',
    description:
      'У вас хороший мышечный фундамент и низкий процент жира. ИМТ мог показать «избыток» из-за мышечной массы — это нормально для тренированных людей.',
    risk: 'Основной риск — перетренированность и травмы при высоких нагрузках без адекватного восстановления.',
    recommendation:
      'Поддерживайте текущий режим тренировок и следите за восстановлением и балансом макронутриентов.',
    ctaText: 'Подтвердить баланс на DXA',
    ctaSubtext: 'DXA покажет точное соотношение мышц и жира по зонам тела',
  },

  age_shift: {
    id: 'age_shift',
    name: 'Возрастные изменения состава тела',
    emoji: '⏳',
    color: '#f59e0b',
    headline: 'После 40 тело меняется — даже если вес стоит.',
    description:
      'С возрастом мышечная масса снижается, а жировая — растёт, даже при стабильном весе. Это увеличивает риск саркопении и потери костной плотности.',
    risk: 'Постепенная потеря мышечной массы (саркопения) повышает риск падений, переломов и снижения функциональной независимости.',
    recommendation:
      'Силовые тренировки и достаточное потребление белка (1.2–1.6 г/кг) помогают замедлить возрастную потерю мышц.',
    ctaText: 'Проверить мышцы и кости на DXA',
    ctaSubtext: 'DXA оценит мышечную массу, костную плотность и распределение жира',
  },

  balanced: {
    id: 'balanced',
    name: 'Сбалансированный состав тела',
    emoji: '✅',
    color: '#22d3ee',
    headline: 'Показатели в пределах нормы.',
    description:
      'По расчётным данным состав тела выглядит сбалансированно. DXA покажет точную картину и даст базу для отслеживания динамики.',
    risk: 'Расчётные методы имеют погрешность — реальные значения могут отличаться от оценочных.',
    recommendation:
      'Поддерживайте текущий образ жизни и периодически проверяйте состав тела для отслеживания тренда.',
    ctaText: 'Получить точную базу на DXA',
    ctaSubtext: 'DXA-сканирование создаст точную базовую точку для отслеживания прогресса',
  },
};

/**
 * Определяет архетип тела на основе комбинации метрик.
 *
 * @param {Object} params
 * @param {number} params.fatPct  — процент жира (%)
 * @param {number} params.bmi     — индекс массы тела
 * @param {number} params.ffmi    — индекс массы без жира
 * @param {number} params.whr     — соотношение талия/бёдра
 * @param {number} params.age     — возраст (лет)
 * @param {string} params.sex     — 'male' | 'female'
 * @returns {Object} архетип (id, name, emoji, color, headline, description, risk, recommendation, ctaText, ctaSubtext)
 */
export function determineArchetype({ fatPct, bmi, ffmi, whr, age, sex }) {
  const isMale = sex === 'male';

  // Пороги fatPct по ACSM: >20% М, >28% Ж — зона повышенного риска
  const fatAboveNorm = isMale ? fatPct > 20 : fatPct > 28;

  // 1. VISCERAL RISK — WHO (2008): WHR ≥0.90 М, ≥0.80 Ж
  const whrHigh = isMale ? whr >= 0.90 : whr >= 0.80;
  if (fatAboveNorm && whrHigh) {
    return { ...ARCHETYPES.visceral_risk };
  }

  // 2. SKINNY FAT — fatPct выше нормы + BMI < 25 (нормальный вес по WHO)
  if (fatAboveNorm && bmi < 25) {
    return { ...ARCHETYPES.skinny_fat };
  }

  // 3. AGE SHIFT — возраст ≥40, fatPct в пограничной зоне (EWGSOP2, 2019)
  const fatBorderline = isMale
    ? fatPct >= 18 && fatPct <= 28
    : fatPct >= 25 && fatPct <= 38;
  if (age >= 40 && fatBorderline) {
    return { ...ARCHETYPES.age_shift };
  }

  // 4. ATHLETIC — низкий fatPct + высокий FFMI (Schutz et al., 2002)
  const fatLow = isMale ? fatPct < 18 : fatPct < 25;
  const ffmiHigh = isMale ? ffmi >= 18 : ffmi >= 15;
  if (fatLow && ffmiHigh) {
    return { ...ARCHETYPES.athletic };
  }

  // 5. BALANCED — default
  return { ...ARCHETYPES.balanced };
}

export const ARCHETYPE_META = {
  skinny_fat: { sharePhrase: 'Весы сказали норм. BODYCOMP показал правду.' },
  visceral_risk: { sharePhrase: 'Скрытый жир внутри. Весы этого не видят.' },
  athletic: { sharePhrase: 'ИМТ посчитал меня толстым. BODYCOMP разобрался.' },
  age_shift: { sharePhrase: 'Тот же вес. Совсем другое тело.' },
  balanced: { sharePhrase: 'Состав тела в балансе. Проверено BODYCOMP.' },
};

