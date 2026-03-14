import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMeta } from "../../utils/useMeta";
import { useJsonLd } from "../../utils/useJsonLd";
import * as tracker from "../../lib/tracker";
import Reveal from "../../components/Reveal";
import { CLINICS } from "../ClinicsPage/data";
import BookingModal from "../ClinicsPage/BookingModal";

// ── Static content ──────────────────────────────────────────

const STEPS = [
  { num: "1", text: "Приходите в клинику без специальной подготовки" },
  { num: "2", text: "Снимаете металлические предметы, ложитесь на стол аппарата" },
  { num: "3", text: "Сканирование занимает менее 6 минут" },
  { num: "4", text: "Получаете подробный отчёт: жир, мышцы, кость, висцеральный жир" },
  { num: "5", text: "Врач разбирает результаты и даёт рекомендации" },
];

const BENEFITS = [
  "Общий % жира и мышечной массы",
  "Висцеральный жир (невидимый снаружи)",
  "Костная плотность (T-score)",
  "Региональный анализ (руки, ноги, туловище)",
  "Сравнение с нормами по полу и возрасту",
  "PDF-отчёт на руки",
];

const AUDIENCE = [
  "Следите за весом и хотите понять, что реально уходит",
  "Тренируетесь и хотите видеть прогресс по мышцам",
  "После 40 — проверить мышцы и кости",
  "После диеты или GLP-1 — убедиться, что уходит жир, а не мышцы",
  "Просто хотите знать правду о составе тела",
];

const FAQ = [
  {
    q: "Нужно ли направление врача?",
    a: "Нет, можно прийти самостоятельно на платное обследование. Направление не требуется.",
  },
  {
    q: "Это больно или опасно?",
    a: "Абсолютно безболезненно. Доза излучения в 10–100 раз ниже обычного рентгена — сопоставима с естественным фоном за несколько часов.",
  },
  {
    q: "Как подготовиться?",
    a: "Специальная подготовка не нужна. Достаточно снять металлические украшения и аксессуары перед процедурой.",
  },
  {
    q: "Как часто можно делать?",
    a: "Для отслеживания динамики состава тела — каждые 3–6 месяцев. Для костной плотности — раз в 1–2 года по рекомендации врача.",
  },
];

// ── Styles ───────────────────────────────────────────────────

const sectionTitle = {
  fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 20, lineHeight: 1.3,
};

const card = {
  background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20,
};

const ctaBtn = {
  width: "100%", padding: "16px 24px", border: "none", borderRadius: 14,
  background: "linear-gradient(135deg, #0891b2, #22d3ee)",
  color: "#020617", fontSize: 16, fontWeight: 800, cursor: "pointer",
  fontFamily: "'JetBrains Mono', monospace",
  boxShadow: "0 0 30px #22d3ee22",
  transition: "all 0.2s",
};

// ── Component ────────────────────────────────────────────────

export default function ClinicPage() {
  const { clinicSlug } = useParams();
  const navigate = useNavigate();
  const clinic = CLINICS.find((c) => c.slug === clinicSlug && !c.comingSoon);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // SEO
  useMeta(
    clinic
      ? `DXA-обследование в ${clinic.name} — запись онлайн | BODYCOMP`
      : "Клиника не найдена | BODYCOMP",
    clinic
      ? `Анализ состава тела на DXA в ${clinic.city}: жир, мышцы, кость, висцеральный жир. ${clinic.address}. Запись: ${clinic.phone}.`
      : "",
  );

  useJsonLd(
    clinic
      ? {
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          name: clinic.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: clinic.address,
            addressLocality: clinic.city,
          },
          telephone: clinic.phone,
          url: clinic.website,
          openingHours: clinic.hours,
          geo: {
            "@type": "GeoCoordinates",
            latitude: clinic.lat,
            longitude: clinic.lng,
          },
          ...(clinic.rating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: clinic.rating,
                  bestRating: 5,
                },
              }
            : {}),
          priceRange: clinic.priceLabel,
        }
      : null,
    "clinic-page",
  );

  // ── Not found ──────────────────────────────────────────────

  if (!clinic) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020617", color: "#e2e8f0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 40, textAlign: "center", fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Клиника не найдена</h1>
        <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 15 }}>
          Возможно, страница была перемещена или клиника ещё не подключена.
        </p>
        <button
          onClick={() => navigate("/clinics")}
          className="btn-lift"
          style={{
            padding: "14px 32px", border: "none", borderRadius: 12,
            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
            color: "#020617", fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Все клиники →
        </button>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────

  const phoneClean = clinic.phone ? clinic.phone.replace(/\D/g, "") : "";

  const handleCtaClick = () => {
    tracker.trackClick("clinic_page_cta_book", {
      clinic_id: clinic.id,
      clinic_slug: clinicSlug,
    });
    setBookingOpen(true);
  };

  const handlePhoneClick = () => {
    tracker.trackClick("clinic_page_phone_call", { clinic_id: clinic.id });
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "#e2e8f0",
      fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 60px", paddingTop: 104 }}>

        {/* Breadcrumbs */}
        <Reveal>
          <div style={{ display: "flex", gap: 8, fontSize: 13, color: "#475569", marginBottom: 24, flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "#475569", textDecoration: "none" }}>Главная</Link>
            <span>/</span>
            <Link to="/clinics" style={{ color: "#475569", textDecoration: "none" }}>Клиники</Link>
            <span>/</span>
            <span style={{ color: "#94a3b8" }}>{clinic.name}</span>
          </div>
        </Reveal>

        {/* ── 1. HERO ─────────────────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, marginBottom: 16, color: "#e2e8f0" }}>
              {clinic.name}
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {/* Address */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#94a3b8" }}>
                <span style={{ fontSize: 16 }}>📍</span>
                {clinic.address}
              </div>

              {/* Phone */}
              {clinic.phone && (
                <a
                  href={`tel:+${phoneClean}`}
                  onClick={handlePhoneClick}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "#22d3ee", textDecoration: "none", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span style={{ fontSize: 16 }}>📞</span>
                  {clinic.phone}
                </a>
              )}

              {/* Hours */}
              {clinic.hours && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#94a3b8" }}>
                  <span style={{ fontSize: 16 }}>🕐</span>
                  {clinic.hours}
                </div>
              )}

              {/* Device */}
              {clinic.device && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}>
                  <span style={{ fontSize: 16 }}>🔬</span>
                  Аппарат: {clinic.device}
                </div>
              )}

              {/* Price */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 14px", borderRadius: 10, background: "#0f172a",
                border: "1px solid #1e293b", alignSelf: "flex-start",
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: clinic.price > 0 ? "#22d3ee" : "#f59e0b", fontFamily: "'JetBrains Mono', monospace" }}>
                  {clinic.price > 0 ? `₽${clinic.price.toLocaleString()}` : clinic.priceLabel}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleCtaClick} className="btn-lift" style={ctaBtn}>
              Записаться на DXA →
            </button>
          </section>
        </Reveal>

        {/* ── 2. КАК ПРОХОДИТ ИССЛЕДОВАНИЕ ───────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>Как проходит исследование</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {STEPS.map((step, i) => (
                <div key={i} style={{
                  ...card, display: "flex", alignItems: "flex-start", gap: 14, padding: 16,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                    color: "#020617", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {step.num}
                  </div>
                  <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── 3. ЧТО ВЫ ПОЛУЧИТЕ ─────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>Что вы получите</h2>
            <div style={card}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {BENEFITS.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "#22d3ee", fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── 4. ДЛЯ КОГО ────────────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>Для кого это исследование</h2>
            <div style={card}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {AUDIENCE.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#10b981",
                      marginTop: 7, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── 5. О КЛИНИКЕ ────────────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>О клинике</h2>
            <div style={card}>
              {clinic.description && (
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, margin: "0 0 16px" }}>
                  {clinic.description}
                </p>
              )}

              {clinic.network && (
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
                  {clinic.network}
                </p>
              )}

              {/* Services tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {clinic.services.map((s, i) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "#22d3ee15", color: "#67e8f9",
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Website link */}
              {clinic.website && (
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 14, color: "#22d3ee", textDecoration: "none", fontWeight: 600,
                  }}
                >
                  Сайт клиники ↗
                </a>
              )}
            </div>
          </section>
        </Reveal>

        {/* ── 6. ЗАПИСЬ ───────────────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>Запись на DXA-обследование</h2>
            <div style={{ ...card, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 20, lineHeight: 1.6 }}>
                Узнайте точный состав своего тела — жир, мышцы, кости, висцеральный жир — за одно исследование.
              </p>

              <button onClick={handleCtaClick} className="btn-lift" style={{ ...ctaBtn, marginBottom: 16 }}>
                Записаться на DXA-обследование →
              </button>

              {clinic.phone && (
                <a
                  href={`tel:+${phoneClean}`}
                  onClick={handlePhoneClick}
                  style={{
                    display: "block", fontSize: 15, color: "#22d3ee",
                    textDecoration: "none", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  или позвоните: {clinic.phone}
                </a>
              )}
            </div>
          </section>
        </Reveal>

        {/* ── 7. FAQ ──────────────────────────────────────── */}
        <Reveal>
          <section style={{ marginBottom: 48 }}>
            <h2 style={sectionTitle}>Частые вопросы</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...card, padding: 0, overflow: "hidden", cursor: "pointer",
                    border: openFaq === i ? "1px solid #22d3ee33" : "1px solid #1e293b",
                  }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", gap: 12,
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.4 }}>
                      {item.q}
                    </span>
                    <span style={{
                      fontSize: 18, color: "#475569", flexShrink: 0,
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}>
                      ▾
                    </span>
                  </div>
                  {openFaq === i && (
                    <div style={{ padding: "0 18px 16px", fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── 8. ДИСКЛЕЙМЕР ───────────────────────────────── */}
        <Reveal>
          <div style={{
            textAlign: "center", fontSize: 12, color: "#475569", lineHeight: 1.6,
            padding: "20px 0", borderTop: "1px solid #1e293b",
          }}>
            Имеются противопоказания. Необходима консультация специалиста.
            <br />
            Информация на сайте не является публичной офертой.
          </div>
        </Reveal>
      </div>

      {/* BookingModal */}
      {bookingOpen && (
        <BookingModal
          clinic={clinic}
          onClose={() => setBookingOpen(false)}
          onConfirm={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
