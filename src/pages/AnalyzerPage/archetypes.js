/**
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
