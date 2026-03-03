import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle } from "../styles";
import PeriodFilter, { getDateRange } from "../components/PeriodFilter";

const TABS = [
  { key: "content", label: "Контент" },
  { key: "calculator", label: "Калькулятор" },
  { key: "quizzes", label: "Квизы" },
  { key: "clicks", label: "Клики" },
  { key: "journeys", label: "Journeys" },
  { key: "cohorts", label: "Когорты" },
];

const PIE_COLORS = ["#22d3ee", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444", "#10b981"];

const tooltipStyle = {
  contentStyle: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    fontSize: 12,
    color: colors.text,
    fontFamily: fonts.body,
  },
  labelStyle: { color: colors.textDim },
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState("content");
  const [period, setPeriod] = useState("month");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
          Аналитика
        </h1>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: tab === t.key ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
              background: tab === t.key ? `${colors.accent}15` : "transparent",
              color: tab === t.key ? colors.accent : colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && <ContentAnalytics period={period} />}
      {tab === "calculator" && <CalculatorAnalytics period={period} />}
      {tab === "quizzes" && <QuizAnalytics period={period} />}
      {tab === "clicks" && <ClickAnalytics period={period} />}
      {tab === "journeys" && <JourneyAnalytics period={period} />}
      {tab === "cohorts" && <CohortAnalysis />}
    </div>
  );
}

// ─── Content Analytics ──────────────────────────────────────
function ContentAnalytics({ period }) {
  const [pages, setPages] = useState([]);
  const [scrollData, setScrollData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [bounceRate, setBounceRate] = useState(0);
  const [attentionPages, setAttentionPages] = useState([]);
  const [selectedAttentionPage, setSelectedAttentionPage] = useState(null);

  useEffect(() => { load(); }, [period]);

  async function load() {
    if (!supabase) return;
    const dateFrom = getDateRange(period);

    // Page views
    let pvQuery = supabase.from("events").select("page").eq("event_type", "page_view");
    if (dateFrom) pvQuery = pvQuery.gte("created_at", dateFrom);
    const { data: pvData } = await pvQuery;

    if (pvData) {
      const counts = {};
      pvData.forEach((e) => { if (e.page) counts[e.page] = (counts[e.page] || 0) + 1; });
      setPages(Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 15).map(([page, views]) => ({ page, views })));
    }

    // Scroll depth
    let sdQuery = supabase.from("events").select("page, meta").eq("event_type", "scroll_depth");
    if (dateFrom) sdQuery = sdQuery.gte("created_at", dateFrom);
    const { data: sdData } = await sdQuery;

    if (sdData) {
      const depths = {};
      const depthCounts = {};
      sdData.forEach((e) => {
        if (e.page && e.meta?.depth) {
          depths[e.page] = Math.max(depths[e.page] || 0, e.meta.depth);
          depthCounts[e.page] = (depthCounts[e.page] || 0) + 1;
        }
      });
      setScrollData(Object.entries(depths).sort(([, a], [, b]) => b - a).slice(0, 10)
        .map(([page, depth]) => ({ page, depth })));
    }

    // Time on page
    let tpQuery = supabase.from("events").select("page, meta").eq("event_type", "time_on_page");
    if (dateFrom) tpQuery = tpQuery.gte("created_at", dateFrom);
    const { data: tpData } = await tpQuery;

    if (tpData) {
      const times = {};
      const timeCounts = {};
      tpData.forEach((e) => {
        if (e.page && e.meta?.seconds) {
          times[e.page] = (times[e.page] || 0) + e.meta.seconds;
          timeCounts[e.page] = (timeCounts[e.page] || 0) + 1;
        }
      });
      setTimeData(Object.entries(times)
        .map(([page, total]) => ({ page, avgTime: Math.round(total / (timeCounts[page] || 1)) }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 10));
    }

    // Bounce rate
    if (pvData) {
      const sessions = {};
      pvData.forEach((e) => {
        // We only have page data here, need session_id for proper bounce rate
      });
    }

    let brQuery = supabase.from("events").select("session_id, page").eq("event_type", "page_view");
    if (dateFrom) brQuery = brQuery.gte("created_at", dateFrom);
    const { data: brData } = await brQuery;

    if (brData) {
      const sessionPages = {};
      brData.forEach((e) => {
        if (!sessionPages[e.session_id]) sessionPages[e.session_id] = new Set();
        sessionPages[e.session_id].add(e.page);
      });
      const totalSessions = Object.keys(sessionPages).length;
      const bouncedSessions = Object.values(sessionPages).filter((s) => s.size === 1).length;
      setBounceRate(totalSessions > 0 ? ((bouncedSessions / totalSessions) * 100).toFixed(1) : 0);
    }

    // Attention score by page (time + scroll + interactions)
    let attentionQuery = supabase.from("events")
      .select("event_type, page, element, session_id, created_at, meta")
      .in("event_type", ["page_view", "time_on_page", "scroll_depth", "form_focus", "click"]);
    if (dateFrom) attentionQuery = attentionQuery.gte("created_at", dateFrom);
    const { data: attentionEvents } = await attentionQuery;

    if (attentionEvents) {
      const metricsByPage = {};

      const ensurePage = (page) => {
        if (!metricsByPage[page]) {
          metricsByPage[page] = {
            page,
            totalTime: 0,
            timeCount: 0,
            maxScroll: 0,
            clickCount: 0,
            formFocusCount: 0,
            formFields: new Set(),
          };
        }
      };

      const bySession = {};
      attentionEvents.forEach((e) => {
        if (!e.session_id) return;
        if (!bySession[e.session_id]) bySession[e.session_id] = [];
        bySession[e.session_id].push(e);
      });

      Object.values(bySession).forEach((events) => {
        events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        let currentPage = null;

        events.forEach((e) => {
          if (e.page) currentPage = e.page;
          const resolvedPage = e.page || currentPage;
          if (!resolvedPage) return;

          ensurePage(resolvedPage);
          const pageData = metricsByPage[resolvedPage];

          if (e.event_type === "time_on_page" && Number.isFinite(e.meta?.seconds)) {
            pageData.totalTime += e.meta.seconds;
            pageData.timeCount += 1;
          }

          if (e.event_type === "scroll_depth" && Number.isFinite(e.meta?.depth)) {
            pageData.maxScroll = Math.max(pageData.maxScroll, e.meta.depth);
          }

          if (e.event_type === "click") {
            pageData.clickCount += 1;
          }

          if (e.event_type === "form_focus") {
            pageData.formFocusCount += 1;
            if (e.element) pageData.formFields.add(e.element);
          }
        });
      });

      const normalized = Object.values(metricsByPage).map((m) => ({
        page: m.page,
        avgTime: m.timeCount > 0 ? m.totalTime / m.timeCount : 0,
        maxScroll: m.maxScroll,
        clickCount: m.clickCount,
        formFieldsCount: m.formFields.size,
        interactionCount: m.clickCount + m.formFocusCount,
      }));

      const maxAvgTime = Math.max(...normalized.map((m) => m.avgTime), 1);
      const maxInteractions = Math.max(...normalized.map((m) => m.interactionCount), 1);

      const withScores = normalized
        .map((m) => ({
          ...m,
          score: Math.round(
            ((m.avgTime / maxAvgTime) * 40)
            + ((m.maxScroll / 100) * 35)
            + ((m.interactionCount / maxInteractions) * 25)
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      setAttentionPages(withScores);
      setSelectedAttentionPage((prev) => {
        if (!withScores.length) return null;
        if (prev && withScores.some((p) => p.page === prev)) return prev;
        return withScores[0].page;
      });
    }
  }

  const selectedAttentionMetrics = attentionPages.find((p) => p.page === selectedAttentionPage);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Top pages */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Популярные страницы</h3>
        <div style={{ width: "100%", height: 300 }}>
          {pages.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={pages} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 80 }}>
                <XAxis type="number" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis type="category" dataKey="page" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="views" fill={colors.accent} radius={[0, 4, 4, 0]} name="Просмотры" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Avg scroll depth */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Глубина скролла (макс %)</h3>
        <div style={{ width: "100%", height: 300 }}>
          {scrollData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={scrollData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 80 }}>
                <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis type="category" dataKey="page" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="depth" fill="#a78bfa" radius={[0, 4, 4, 0]} name="Глубина %" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Avg time on page */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Среднее время на странице (сек)</h3>
        <div style={{ width: "100%", height: 300 }}>
          {timeData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={timeData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 80 }}>
                <XAxis type="number" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis type="category" dataKey="page" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avgTime" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Секунды" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Bounce rate */}
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h3 style={sectionTitle}>Bounce Rate</h3>
        <div style={{ fontSize: 56, fontWeight: 800, color: colors.accent, fontFamily: fonts.mono }}>
          {bounceRate}%
        </div>
        <div style={{ fontSize: 13, color: colors.textDim, fontFamily: fonts.body, marginTop: 8 }}>
          сессий с одной страницей
        </div>
      </div>

      {/* Attention block */}
      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <h3 style={sectionTitle}>Attention</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
          <div style={{ width: "100%", height: 320 }}>
            {attentionPages.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={attentionPages} layout="vertical" margin={{ top: 5, right: 12, bottom: 5, left: 90 }}>
                  <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="page"
                    tick={{ ...axisTick, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={85}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar
                    dataKey="score"
                    fill="#14b8a6"
                    radius={[0, 4, 4, 0]}
                    name="Attention score"
                    onClick={(entry) => setSelectedAttentionPage(entry?.page || null)}
                    style={{ cursor: "pointer" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>

          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, background: `${colors.bgSecondary || colors.card}` }}>
            <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 8 }}>
              Детализация (клик по странице в топе)
            </div>
            {selectedAttentionMetrics ? (
              <>
                <div style={{ fontSize: 13, color: colors.text, fontFamily: fonts.body, fontWeight: 700, marginBottom: 10 }}>
                  {selectedAttentionMetrics.page}
                </div>
                <MetricRow label="Composite score" value={selectedAttentionMetrics.score} accent={colors.accent} />
                <MetricRow label="Время на странице (сред., сек)" value={selectedAttentionMetrics.avgTime.toFixed(1)} />
                <MetricRow label="Глубина скролла (макс, %)" value={Math.round(selectedAttentionMetrics.maxScroll)} />
                <MetricRow label="Click count" value={selectedAttentionMetrics.clickCount} />
                <MetricRow label="Form focus (уник. полей)" value={selectedAttentionMetrics.formFieldsCount} />
                <MetricRow label="Interactions (click + form_focus)" value={selectedAttentionMetrics.interactionCount} />
              </>
            ) : <EmptyState />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calculator Analytics ──────────────────────────────────
function CalculatorAnalytics({ period }) {
  const [startsVsCompletes, setStartsVsCompletes] = useState([]);
  const [avgStats, setAvgStats] = useState({ fat: 0, bmi: 0, count: 0 });
  const [bmiDist, setBmiDist] = useState([]);
  const [fatCategories, setFatCategories] = useState([]);

  useEffect(() => { load(); }, [period]);

  async function load() {
    if (!supabase) return;
    const dateFrom = getDateRange(period);

    // Starts vs completes by day
    let evQuery = supabase.from("events").select("event_type, created_at")
      .in("event_type", ["calc_start", "calc_complete"]);
    if (dateFrom) evQuery = evQuery.gte("created_at", dateFrom);
    const { data: evData } = await evQuery;

    if (evData) {
      const byDay = {};
      evData.forEach((e) => {
        const day = e.created_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { starts: 0, completes: 0 };
        if (e.event_type === "calc_start") byDay[day].starts++;
        else byDay[day].completes++;
      });
      setStartsVsCompletes(
        Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
          .map(([date, v]) => ({
            date: new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
            ...v,
          }))
      );
    }

    // Calc results stats
    let crQuery = supabase.from("calc_results").select("fat_pct, bmi, gender");
    if (dateFrom) crQuery = crQuery.gte("created_at", dateFrom);
    const { data: crData } = await crQuery;

    if (crData && crData.length > 0) {
      const totalFat = crData.reduce((s, r) => s + (r.fat_pct || 0), 0);
      const totalBmi = crData.reduce((s, r) => s + (r.bmi || 0), 0);
      setAvgStats({
        fat: (totalFat / crData.length).toFixed(1),
        bmi: (totalBmi / crData.length).toFixed(1),
        count: crData.length,
      });

      // BMI distribution
      const bmiGroups = { "< 18.5": 0, "18.5–25": 0, "25–30": 0, "> 30": 0 };
      crData.forEach((r) => {
        if (r.bmi < 18.5) bmiGroups["< 18.5"]++;
        else if (r.bmi < 25) bmiGroups["18.5–25"]++;
        else if (r.bmi < 30) bmiGroups["25–30"]++;
        else bmiGroups["> 30"]++;
      });
      setBmiDist(Object.entries(bmiGroups).map(([name, value]) => ({ name, value })));

      // Fat categories
      const fatGroups = { "Норма": 0, "Лишний вес": 0, "Ожирение": 0, "Skinny Fat": 0 };
      crData.forEach((r) => {
        const isMale = r.gender === "male";
        if (r.fat_pct < (isMale ? 20 : 28)) {
          if (r.bmi > 25) fatGroups["Skinny Fat"]++;
          else fatGroups["Норма"]++;
        } else if (r.fat_pct < (isMale ? 25 : 35)) fatGroups["Лишний вес"]++;
        else fatGroups["Ожирение"]++;
      });
      setFatCategories(Object.entries(fatGroups).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })));
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Starts vs completes */}
      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <h3 style={sectionTitle}>Начатые vs завершённые расчёты</h3>
        <div style={{ width: "100%", height: 250 }}>
          {startsVsCompletes.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={startsVsCompletes} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <XAxis dataKey="date" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: fonts.mono }} />
                <Bar dataKey="starts" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Начато" />
                <Bar dataKey="completes" fill={colors.accent} radius={[4, 4, 0, 0]} name="Завершено" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Avg stats */}
      <div style={{ ...cardStyle, display: "flex", gap: 40, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>СРЕДНИЙ % ЖИРА</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#ef4444", fontFamily: fonts.mono }}>{avgStats.fat}%</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>СРЕДНИЙ ИМТ</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#3b82f6", fontFamily: fonts.mono }}>{avgStats.bmi}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>РАСЧЁТОВ</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: colors.accent, fontFamily: fonts.mono }}>{avgStats.count}</div>
        </div>
      </div>

      {/* BMI distribution */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Распределение ИМТ</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 160, height: 160 }}>
            {bmiDist.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={bmiDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {bmiDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bmiDist.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{d.name}</span>
                <span style={{ fontSize: 12, color: colors.text, fontFamily: fonts.mono, fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fat categories */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Категории по жиру</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 160, height: 160 }}>
            {fatCategories.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={fatCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {fatCategories.map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fatCategories.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[(i + 2) % PIE_COLORS.length] }} />
                <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{d.name}</span>
                <span style={{ fontSize: 12, color: colors.text, fontFamily: fonts.mono, fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Analytics ────────────────────────────────────────
function QuizAnalytics({ period }) {
  const [quizStats, setQuizStats] = useState([]);
  const [shareRate, setShareRate] = useState(0);

  useEffect(() => { load(); }, [period]);

  async function load() {
    if (!supabase) return;
    const dateFrom = getDateRange(period);

    let qrQuery = supabase.from("quiz_results").select("quiz_slug, score, share_count");
    if (dateFrom) qrQuery = qrQuery.gte("created_at", dateFrom);
    const { data } = await qrQuery;

    if (data) {
      const bySlug = {};
      let totalShares = 0;
      data.forEach((r) => {
        if (!bySlug[r.quiz_slug]) bySlug[r.quiz_slug] = { scores: [], count: 0 };
        bySlug[r.quiz_slug].scores.push(r.score);
        bySlug[r.quiz_slug].count++;
        totalShares += r.share_count || 0;
      });

      setQuizStats(
        Object.entries(bySlug).map(([slug, v]) => ({
          slug,
          completions: v.count,
          avgScore: (v.scores.reduce((s, sc) => s + sc, 0) / v.scores.length).toFixed(1),
        }))
      );
      setShareRate(data.length > 0 ? ((totalShares / data.length) * 100).toFixed(1) : 0);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Прохождения по квизам</h3>
        <div style={{ width: "100%", height: 300 }}>
          {quizStats.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={quizStats} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <XAxis dataKey="slug" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="completions" fill={colors.accent} radius={[4, 4, 0, 0]} name="Прохождений" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: colors.textDim, fontFamily: fonts.mono, marginBottom: 4 }}>SHARE RATE</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#f59e0b", fontFamily: fonts.mono }}>{shareRate}%</div>
        </div>
        <div style={cardStyle}>
          <h3 style={sectionTitle}>Средний балл</h3>
          {quizStats.map((q) => (
            <div key={q.slug} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>{q.slug}</span>
              <span style={{ fontSize: 13, color: colors.text, fontFamily: fonts.mono, fontWeight: 600 }}>{q.avgScore}</span>
            </div>
          ))}
          {quizStats.length === 0 && <EmptyState />}
        </div>
      </div>
    </div>
  );
}

// ─── Click Analytics ───────────────────────────────────────
function ClickAnalytics({ period }) {
  const [clicks, setClicks] = useState([]);
  const [elementFilter, setElementFilter] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState(period);
  const [pageOptions, setPageOptions] = useState([]);

  useEffect(() => {
    setPeriodFilter(period);
  }, [period]);

  useEffect(() => { load(); }, [periodFilter, pageFilter, elementFilter]);

  async function load() {
    if (!supabase) return;
    const dateFrom = getDateRange(periodFilter);

    let query = supabase.from("events").select("element, page").eq("event_type", "click");
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (pageFilter !== "all") query = query.eq("page", pageFilter);
    if (elementFilter.trim()) query = query.ilike("element", `%${elementFilter.trim()}%`);

    const { data } = await query;

    if (data) {
      const counts = {};
      const pages = new Set();

      data.forEach((e) => {
        const page = e.page || "(без page)";
        if (e.page) pages.add(e.page);
        if (!e.element) return;

        const key = `${e.element}|||${page}`;
        if (!counts[key]) counts[key] = { element: e.element, page, count: 0 };
        counts[key].count += 1;
      });

      setPageOptions(Array.from(pages).sort());
      setClicks(
        Object.values(counts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)
          .map((row) => ({ ...row, label: `${row.element} • ${row.page}` }))
      );
    }
  }

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>Топ-20 кликаемых элементов</h3>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <input
          value={elementFilter}
          onChange={(e) => setElementFilter(e.target.value)}
          placeholder="element contains"
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: "8px 10px",
            fontFamily: fonts.body,
            fontSize: 12,
          }}
        />

        <select
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: "8px 10px",
            fontFamily: fonts.body,
            fontSize: 12,
          }}
        >
          <option value="all">Все page</option>
          {pageOptions.map((page) => (
            <option key={page} value={page}>{page}</option>
          ))}
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: "8px 10px",
            fontFamily: fonts.body,
            fontSize: 12,
          }}
        >
          <option value="today">Сегодня</option>
          <option value="week">7 дней</option>
          <option value="month">30 дней</option>
          <option value="all">Все время</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 500 }}>
        {clicks.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={clicks} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 220 }}>
              <XAxis type="number" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} width={215} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} name="Кликов" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </div>
    </div>
  );
}

// ─── Journey Analytics ─────────────────────────────────────
function JourneyAnalytics({ period }) {
  const [topJourneys, setTopJourneys] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [conversionPaths, setConversionPaths] = useState([]);

  useEffect(() => { load(); }, [period]);

  async function load() {
    if (!supabase) return;
    const dateFrom = getDateRange(period);

    let pvQuery = supabase
      .from("events")
      .select("session_id, page, created_at")
      .eq("event_type", "page_view")
      .not("session_id", "is", null);
    if (dateFrom) pvQuery = pvQuery.gte("created_at", dateFrom);

    const { data: pageViews } = await pvQuery;
    if (!pageViews || pageViews.length === 0) {
      setTopJourneys([]);
      setTotalSessions(0);
      setConversionPaths([]);
      return;
    }

    const sessionEvents = {};
    pageViews.forEach((event) => {
      if (!event.session_id || !event.page || !event.created_at) return;
      if (!sessionEvents[event.session_id]) sessionEvents[event.session_id] = [];
      sessionEvents[event.session_id].push(event);
    });

    const sessionPaths = {};
    Object.entries(sessionEvents).forEach(([sessionId, events]) => {
      const orderedPages = events
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((e) => e.page)
        .filter(Boolean);

      if (orderedPages.length === 0) return;

      const compactPath = orderedPages.filter((page, idx) => idx === 0 || orderedPages[idx - 1] !== page);
      sessionPaths[sessionId] = compactPath;
    });

    const total = Object.keys(sessionPaths).length;
    setTotalSessions(total);

    const pathCounts = {};
    Object.values(sessionPaths).forEach((pages) => {
      const chain = pages.join(" -> ");
      pathCounts[chain] = (pathCounts[chain] || 0) + 1;
    });

    setTopJourneys(
      Object.entries(pathCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, count]) => ({
          path,
          count,
          share: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0",
        }))
    );

    let convQuery = supabase
      .from("events")
      .select("session_id, event_type, element, created_at")
      .in("event_type", ["booking_click", "click"])
      .not("session_id", "is", null);
    if (dateFrom) convQuery = convQuery.gte("created_at", dateFrom);

    const { data: conversionEvents } = await convQuery;
    if (!conversionEvents || conversionEvents.length === 0) {
      setConversionPaths([]);
      return;
    }

    const conversionStats = {};
    conversionEvents.forEach((event) => {
      const isWaitlistSubmit = event.event_type === "click" && event.element === "waitlist_submit";
      const isBookingClick = event.event_type === "booking_click";
      if (!isWaitlistSubmit && !isBookingClick) return;
      if (!sessionPaths[event.session_id]) return;

      const conversionKey = isWaitlistSubmit ? "waitlist_submit" : "booking_click";
      const pages = sessionPaths[event.session_id];
      const shortPath = [...pages.slice(-3), conversionKey].join(" -> ");
      const key = `${conversionKey}::${shortPath}`;
      conversionStats[key] = {
        conversion: conversionKey,
        path: shortPath,
        count: (conversionStats[key]?.count || 0) + 1,
      };
    });

    setConversionPaths(
      Object.values(conversionStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
      <div style={cardStyle}>
        <h3 style={sectionTitle}>Top journey-цепочки</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.mono, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={cohortTh}>Путь</th>
                <th style={cohortTh}>Сессии</th>
                <th style={cohortTh}>Доля</th>
              </tr>
            </thead>
            <tbody>
              {topJourneys.map((item) => (
                <tr key={item.path}>
                  <td style={{ ...cohortTd, color: colors.text }}>{item.path}</td>
                  <td style={cohortTd}>{item.count}</td>
                  <td style={cohortTd}>{item.share}%</td>
                </tr>
              ))}
              {topJourneys.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...cohortTd, textAlign: "center", color: colors.textDim, padding: 24 }}>
                    Нет данных за период
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: colors.textDim, fontFamily: fonts.body }}>
          Всего сессий в периоде: {totalSessions}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Короткие конверсионные пути</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.mono, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={cohortTh}>Конверсия</th>
                <th style={cohortTh}>Путь</th>
                <th style={cohortTh}>Сессии</th>
              </tr>
            </thead>
            <tbody>
              {conversionPaths.map((item) => (
                <tr key={`${item.conversion}:${item.path}`}>
                  <td style={cohortTd}>{item.conversion}</td>
                  <td style={{ ...cohortTd, color: colors.text }}>{item.path}</td>
                  <td style={cohortTd}>{item.count}</td>
                </tr>
              ))}
              {conversionPaths.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ ...cohortTd, textAlign: "center", color: colors.textDim, padding: 24 }}>
                    Нет данных по конверсиям за период
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Cohort Analysis ───────────────────────────────────────
function CohortAnalysis() {
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!supabase) return;

    // Get users with creation date
    const { data: users } = await supabase.from("users").select("id, created_at");
    if (!users) return;

    // Get events with user_id
    const { data: events } = await supabase.from("events")
      .select("user_id, created_at")
      .eq("event_type", "page_view")
      .not("user_id", "is", null);

    if (!events) return;

    // Group users by registration week
    const getWeek = (d) => {
      const date = new Date(d);
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = date - start;
      return `${date.getFullYear()}-W${String(Math.ceil(diff / 604800000)).padStart(2, "0")}`;
    };

    const userWeekMap = {};
    users.forEach((u) => {
      userWeekMap[u.id] = getWeek(u.created_at);
    });

    // Group events by user's cohort week and event week
    const cohortData = {};
    events.forEach((e) => {
      if (!e.user_id || !userWeekMap[e.user_id]) return;
      const cohortWeek = userWeekMap[e.user_id];
      const eventWeek = getWeek(e.created_at);
      if (!cohortData[cohortWeek]) cohortData[cohortWeek] = { size: 0, weeks: {} };
      if (!cohortData[cohortWeek].weeks[eventWeek]) cohortData[cohortWeek].weeks[eventWeek] = new Set();
      cohortData[cohortWeek].weeks[eventWeek].add(e.user_id);
    });

    // Count cohort sizes
    users.forEach((u) => {
      const w = getWeek(u.created_at);
      if (!cohortData[w]) cohortData[w] = { size: 0, weeks: {} };
      cohortData[w].size++;
    });

    // Build table data (last 8 weeks)
    const allWeeks = Object.keys(cohortData).sort().slice(-8);
    const maxWeeksAfter = 6;

    const rows = allWeeks.map((week) => {
      const d = cohortData[week];
      const retention = [];
      for (let i = 0; i <= maxWeeksAfter; i++) {
        const weeksSorted = Object.keys(d.weeks).sort();
        const targetWeek = weeksSorted[i];
        if (targetWeek) {
          const active = d.weeks[targetWeek]?.size || 0;
          retention.push(d.size > 0 ? ((active / d.size) * 100).toFixed(0) : 0);
        } else {
          retention.push(null);
        }
      }
      return { week, size: d.size, retention };
    });

    setCohorts(rows);
  }

  const getRetentionColor = (pct) => {
    if (pct === null) return "transparent";
    const p = Number(pct);
    if (p >= 50) return "#10b98140";
    if (p >= 30) return "#22d3ee30";
    if (p >= 15) return "#f59e0b25";
    if (p > 0) return "#ef444420";
    return `${colors.border}50`;
  };

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>Когортный анализ (retention по неделям)</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.mono, fontSize: 11 }}>
          <thead>
            <tr>
              <th style={cohortTh}>Когорта</th>
              <th style={cohortTh}>Размер</th>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} style={cohortTh}>Нед. {i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((row) => (
              <tr key={row.week}>
                <td style={cohortTd}>{row.week}</td>
                <td style={{ ...cohortTd, color: colors.text, fontWeight: 600 }}>{row.size}</td>
                {row.retention.map((pct, i) => (
                  <td key={i} style={{
                    ...cohortTd,
                    background: getRetentionColor(pct),
                    color: pct !== null ? colors.text : "transparent",
                    textAlign: "center",
                  }}>
                    {pct !== null ? `${pct}%` : "—"}
                  </td>
                ))}
              </tr>
            ))}
            {cohorts.length === 0 && (
              <tr>
                <td colSpan={9} style={{ ...cohortTd, textAlign: "center", color: colors.textDim, padding: 32 }}>
                  Недостаточно данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────
const sectionTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: colors.text,
  fontFamily: fonts.body,
  margin: "0 0 16px",
};

const axisTick = { fill: colors.textDim, fontSize: 10, fontFamily: fonts.mono };

const cohortTh = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textDim,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const cohortTd = {
  padding: "6px 10px",
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textMuted,
  fontSize: 11,
};

function EmptyState() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", color: colors.textDim, fontFamily: fonts.mono, fontSize: 12,
    }}>
      Нет данных за период
    </div>
  );
}

function MetricRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{label}</span>
      <span style={{ fontSize: 12, color: accent || colors.text, fontFamily: fonts.mono, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
