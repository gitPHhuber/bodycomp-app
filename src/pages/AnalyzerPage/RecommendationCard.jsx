import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as tracker from "../../lib/tracker";

function getRecommendation(bodyType, fatPct, bmi, ffmi, visceralRisk, gender, age) {
  // 1. Excess fat + visceral risk
  if (bodyType.type === "Избыточный жир" && visceralRisk.level !== "Низкий") {
    return {
      id: "visceral_high",
      emoji: "🔴",
      title: "Повышенный жир + висцеральный риск",
      text: "Ваш процент жира выше нормы, а соотношение талия/бёдра указывает на накопление внутреннего жира. Висцеральный жир невидим снаружи, но связан с рисками для сердца и метаболизма. DXA точно измерит, сколько именно висцерального жира и где он сконцентрирован.",
      cta: "Измерить висцеральный жир на DXA",
      color: "#ef4444",
    };
  }

  // 2. Excess fat + low visceral
  if (bodyType.type === "Избыточный жир" && visceralRisk.level === "Низкий") {
    return {
      id: "excess_fat_low_visceral",
      emoji: "🟠",
      title: "Жир повышен — но где именно?",
      text: "Процент жира выше нормы, при этом висцеральный риск пока низкий. Это может означать, что жир преимущественно подкожный — менее опасный, но всё равно требующий внимания. DXA покажет точное распределение жира по зонам тела.",
      cta: "Узнать распределение жира на DXA",
      color: "#f97316",
    };
  }

  // 3. Average + normal BMI
  if (bodyType.type === "Среднее" && bmi < 25) {
    return {
      id: "hidden_fat",
      emoji: "🟡",
      title: "Нормальный вес — но есть ли скрытый жир?",
      text: "Ваши показатели в среднем диапазоне, а ИМТ в норме. Но калькулятор имеет погрешность ±5–8%. У людей с нормальным весом реальный процент жира может оказаться выше расчётного — это называют «skinny fat». DXA покажет точную картину.",
      cta: "Проверить, нет ли скрытого жира",
      color: "#f59e0b",
    };
  }

  // 4. Average + elevated BMI
  if (bodyType.type === "Среднее" && bmi >= 25) {
    return {
      id: "bmi_elevated",
      emoji: "🟡",
      title: "ИМТ повышен — жир или мышцы?",
      text: "ИМТ выше 25 не всегда означает лишний жир — это может быть мышечная масса. Калькулятор не различает их с высокой точностью. DXA разделит тело на жир, мышцы и кости и покажет, нужно ли что-то менять.",
      cta: "Узнать точный состав тела на DXA",
      color: "#f59e0b",
    };
  }

  // 5. Athletic / Fit
  if (bodyType.type === "Атлетическое" || bodyType.type === "Подтянутое") {
    return {
      id: "athletic_balance",
      emoji: "💪",
      title: "Отличная форма — посмотрите мышечный баланс",
      text: "У вас хороший процент жира и мышечная масса. DXA покажет то, чего не видит калькулятор: баланс мышц между левой и правой стороной, распределение по зонам (руки, ноги, туловище) и точную костную плотность.",
      cta: "Увидеть мышечный баланс на DXA",
      color: "#10b981",
    };
  }

  // 6. Age >= 40
  if (age >= 40) {
    return {
      id: "age_40_plus",
      emoji: "📊",
      title: "После 40 — следите за мышцами и костями",
      text: "С возрастом тело теряет мышечную массу и костную плотность, даже если вес стабилен. Калькулятор этого не покажет. DXA измерит мышцы, кости и скрытый жир — и даст базу для отслеживания изменений.",
      cta: "Проверить мышцы и кости на DXA",
      color: "#3b82f6",
    };
  }

  // 7. Default
  return {
    id: "default",
    emoji: "📋",
    title: "Калькулятор — приблизительно. DXA — точно.",
    text: "Расчёт по обхватам имеет погрешность ±5–8%. DXA-денситометрия покажет точный процент жира, мышечную массу, костную плотность и висцеральный жир за одно 6-минутное исследование.",
    cta: "Записаться на точный DXA-анализ",
    color: "#22d3ee",
  };
}

export default function RecommendationCard({ bodyType, fatPct, bmi, ffmi, visceralRisk, gender, age }) {
  const navigate = useNavigate();
  const rec = getRecommendation(bodyType, fatPct, bmi, ffmi, visceralRisk, gender, parseFloat(age));

  useEffect(() => {
    tracker.trackEvent("recommendation_shown", {
      variant: rec.id,
      body_type: bodyType.type,
      fat_pct: fatPct,
      bmi,
    });
  }, [rec.id, bodyType.type, fatPct, bmi]);

  function handleCtaClick() {
    tracker.trackClick("recommendation_cta_dxa", {
      variant: rec.id,
      body_type: bodyType.type,
      fat_pct: fatPct,
    });
    navigate("/clinics");
  }

  // Darken color for gradient end
  const darkerColor = rec.color + "cc";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.7), rgba(30,41,59,0.5))",
        border: `1px solid ${rec.color}20`,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
      }}
    >
      {/* Title */}
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
        {rec.emoji}  {rec.title}
      </div>

      {/* Text */}
      <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
        {rec.text}
      </div>

      {/* Accuracy note */}
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>
        Расчёт приблизительный (±5–8%).
        <br />
        DXA покажет реальную картину за 6 минут.
      </div>

      {/* CTA Button */}
      <button
        onClick={handleCtaClick}
        style={{
          width: "100%",
          padding: "13px 24px",
          border: "none",
          borderRadius: 14,
          background: `linear-gradient(135deg, ${rec.color}, ${darkerColor})`,
          color: rec.color === "#f59e0b" || rec.color === "#22d3ee" || rec.color === "#10b981" ? "#020617" : "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        {rec.cta} →
      </button>

      {/* Subtitle */}
      <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 12 }}>
        Безболезненно · без подготовки · подробный отчёт
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 10, color: "#475569", textAlign: "center", fontStyle: "italic", lineHeight: 1.5 }}>
        Имеются противопоказания.
        <br />
        Необходима консультация специалиста.
      </div>
    </div>
  );
}
