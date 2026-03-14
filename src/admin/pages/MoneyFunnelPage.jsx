import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle } from "../styles";
import StatCard from "../components/StatCard";
import PeriodFilter, { getDateRange } from "../components/PeriodFilter";
import ConversionFunnel from "../components/ConversionFunnel";

export default function MoneyFunnelPage() {
  const [period, setPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [funnelSteps, setFunnelSteps] = useState([]);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    visitToLeadPct: 0,
    completedScans: 0,
    revenue: 0,
    repeatCount: 0,
    couponRate: 0,
  });

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const dateFrom = getDateRange(period);

    try {
      // Build event count queries
      const eventCountQuery = (eventType) => {
        let q = supabase.from("events").select("*", { count: "exact", head: true }).eq("event_type", eventType);
        if (dateFrom) q = q.gte("created_at", dateFrom);
        return q;
      };

      // CTA click query (element LIKE '%cta_dxa%' OR element='offer_cta_click')
      let ctaQuery = supabase.from("events").select("*", { count: "exact", head: true })
        .or("element.like.%cta_dxa%,element.eq.offer_cta_click");
      if (dateFrom) ctaQuery = ctaQuery.gte("created_at", dateFrom);

      // Bookings query — fetch all to compute multiple metrics
      let bookingsQuery = supabase.from("bookings").select("*");
      if (dateFrom) bookingsQuery = bookingsQuery.gte("created_at", dateFrom);

      const [
        { count: pageViewCount },
        { count: calcStartCount },
        { count: calcCompleteCount },
        { count: offerViewCount },
        { count: ctaClickCount },
        { data: bookings },
      ] = await Promise.all([
        eventCountQuery("page_view"),
        eventCountQuery("calc_start"),
        eventCountQuery("calc_complete"),
        eventCountQuery("offer_view"),
        ctaQuery,
        bookingsQuery,
      ]);

      const allBookings = bookings || [];
      const activeStatuses = ["lead", "confirmed", "completed"];
      const leadCount = allBookings.filter((b) => activeStatuses.includes(b.status)).length;
      const confirmedCount = allBookings.filter((b) => b.status === "confirmed").length;
      const completedCount = allBookings.filter((b) => b.status === "completed").length;
      const repeatCount = allBookings.filter((b) => b.scan_type === "repeat").length;
      const withCoupon = allBookings.filter((b) => b.coupon_code).length;
      const couponRate = allBookings.length > 0 ? ((withCoupon / allBookings.length) * 100).toFixed(1) : 0;

      const visitToLeadPct = (pageViewCount || 0) > 0
        ? ((leadCount / pageViewCount) * 100).toFixed(2)
        : 0;

      // Revenue placeholder: completed × 2000₽
      const revenue = completedCount * 2000;

      setFunnelSteps([
        { label: "Визиты", value: pageViewCount || 0 },
        { label: "Калькулятор начат", value: calcStartCount || 0 },
        { label: "Калькулятор завершён", value: calcCompleteCount || 0 },
        { label: "Оффер показан", value: offerViewCount || 0 },
        { label: "CTA клик", value: ctaClickCount || 0 },
        { label: "Заявка создана", value: leadCount },
        { label: "Подтверждена", value: confirmedCount },
        { label: "Выполнена", value: completedCount },
        { label: "Повторная запись", value: repeatCount },
      ]);

      setMetrics({
        totalLeads: leadCount,
        visitToLeadPct,
        completedScans: completedCount,
        revenue,
        repeatCount,
        couponRate,
      });
    } catch (err) {
      console.error("MoneyFunnel load error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            Воронка до денег
          </h1>
          <p style={{ fontSize: 13, color: colors.textDim, margin: "4px 0 0", fontFamily: fonts.body }}>
            Сквозная аналитика от визита до выручки
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard
          label="Заявок"
          value={metrics.totalLeads}
          sub="за период"
          color={colors.accent}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <StatCard
          label="Визит → заявка"
          value={`${metrics.visitToLeadPct}%`}
          sub="конверсия"
          color="#3b82f6"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard
          label="Completed"
          value={metrics.completedScans}
          sub="выполненных сканов"
          color={colors.success}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="Выручка"
          value={`${metrics.revenue.toLocaleString()} ₽`}
          sub="completed × 2 000 ₽"
          color="#f59e0b"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="Повторные"
          value={metrics.repeatCount}
          sub="записей repeat"
          color={colors.purple}
          icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
        <StatCard
          label="Купон rate"
          value={`${metrics.couponRate}%`}
          sub="с купон-кодом"
          color={colors.accent}
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </div>

      {/* Funnel */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: "0 0 16px" }}>
          Сквозная воронка
        </h3>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12 }}>
            Загрузка...
          </div>
        ) : (
          <ConversionFunnel steps={funnelSteps} />
        )}
      </div>
    </div>
  );
}
