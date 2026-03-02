import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, inputStyle, labelStyle, btnPrimary, btnSecondary, btnDanger } from "../styles";
import StatCard from "../components/StatCard";

export default function TelegramPage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [botStats, setBotStats] = useState({ subscribers: 0, dau: 0, messagesToday: 0 });
  const [settings, setSettings] = useState({
    welcome_message: "",
    daily_reminder: "",
    lesson_schedule: "",
    notify_before_dxa: "",
    notify_after_dxa: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => { loadConfig(); loadStats(); }, []);

  async function loadConfig() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase.from("bot_config").select("key, value");
    const cfg = {};
    (data || []).forEach((r) => { cfg[r.key] = r.value; });
    setConfig(cfg);
    setToken(cfg.bot_token || "");

    setSettings({
      welcome_message: cfg.welcome_message || "",
      daily_reminder: cfg.daily_reminder || "",
      lesson_schedule: cfg.lesson_schedule || "",
      notify_before_dxa: cfg.notify_before_dxa || "",
      notify_after_dxa: cfg.notify_after_dxa || "",
    });

    setLoading(false);
  }

  async function loadStats() {
    if (!supabase) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      { count: subscribers },
      { count: messagesToday },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).not("tg_id", "is", null),
      supabase.from("events").select("*", { count: "exact", head: true })
        .eq("source", "telegram")
        .gte("created_at", todayStart.toISOString()),
    ]);

    // DAU: unique users from TG today
    const { data: dauData } = await supabase
      .from("events")
      .select("user_id")
      .eq("source", "telegram")
      .gte("created_at", todayStart.toISOString());

    const uniqueUsers = new Set((dauData || []).map((e) => e.user_id).filter(Boolean));

    setBotStats({
      subscribers: subscribers || 0,
      dau: uniqueUsers.size,
      messagesToday: messagesToday || 0,
    });
  }

  async function handleConnect() {
    if (!token.trim()) return;
    setConnecting(true);

    try {
      // Call Telegram getMe
      const meRes = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`);
      const meData = await meRes.json();

      if (!meData.ok) {
        alert("Ошибка: " + (meData.description || "Неверный токен"));
        setConnecting(false);
        return;
      }

      const botName = meData.result.username;

      // Set webhook
      const webhookUrl = `${window.location.origin}/.netlify/functions/telegram-webhook`;
      const whRes = await fetch(`https://api.telegram.org/bot${token.trim()}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });
      const whData = await whRes.json();

      // Save config
      const configs = [
        { key: "bot_token", value: token.trim() },
        { key: "bot_name", value: botName },
        { key: "bot_status", value: whData.ok ? "active" : "error" },
        { key: "webhook_url", value: webhookUrl },
      ];

      for (const cfg of configs) {
        await supabase.from("bot_config").upsert(cfg, { onConflict: "key" });
      }

      await loadConfig();
    } catch (err) {
      alert("Ошибка подключения: " + err.message);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!config.bot_token) return;
    if (!window.confirm("Отключить бота?")) return;

    try {
      await fetch(`https://api.telegram.org/bot${config.bot_token}/deleteWebhook`);

      await supabase.from("bot_config").upsert(
        { key: "bot_status", value: "disconnected" },
        { onConflict: "key" }
      );
      await supabase.from("bot_config").delete().eq("key", "bot_token");
      await supabase.from("bot_config").delete().eq("key", "webhook_url");

      setToken("");
      await loadConfig();
    } catch (err) {
      alert("Ошибка отключения: " + err.message);
    }
  }

  async function handleSaveSettings() {
    if (!supabase) return;
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      for (const [key, value] of Object.entries(settings)) {
        if (value) {
          await supabase.from("bot_config").upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          );
        }
      }
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) {
      alert("Ошибка сохранения: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  const status = config.bot_status || "disconnected";
  const statusColors = {
    active: { bg: "#10b98120", color: "#10b981", label: "Активен" },
    error: { bg: "#ef444420", color: "#ef4444", label: "Ошибка" },
    disconnected: { bg: "#64748b20", color: "#64748b", label: "Не подключён" },
  };
  const st = statusColors[status] || statusColors.disconnected;

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: "0 0 24px" }}>
        Каналы — Telegram Bot
      </h1>

      {/* Bot status card */}
      <div style={{ ...cardStyle, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: st.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={st.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.text, fontFamily: fonts.body }}>
              {config.bot_name ? `@${config.bot_name}` : "Telegram Bot"}
            </span>
            <span style={{
              padding: "2px 10px", borderRadius: 6, fontSize: 11, fontFamily: fonts.mono,
              background: st.bg, color: st.color,
            }}>
              {st.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.textDim, fontFamily: fonts.mono }}>
            {config.webhook_url || "Webhook не настроен"}
          </div>
        </div>
        {status === "active" && (
          <button onClick={handleDisconnect} style={btnDanger}>
            Отключить
          </button>
        )}
      </div>

      {/* Connect section */}
      {status !== "active" && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: "0 0 16px" }}>
            Подключить бота
          </h3>
          <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, marginBottom: 16 }}>
            Получите токен у @BotFather в Telegram и вставьте его ниже.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              style={{ ...inputStyle, flex: 1, fontFamily: fonts.mono, fontSize: 12 }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
            <button
              onClick={handleConnect}
              disabled={connecting || !token.trim()}
              style={{
                ...btnPrimary,
                opacity: connecting || !token.trim() ? 0.5 : 1,
                cursor: connecting || !token.trim() ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {connecting ? "Подключаем..." : "Подключить"}
            </button>
          </div>
        </div>
      )}

      {/* Bot stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Подписчики"
          value={botStats.subscribers}
          color={colors.accent}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
        <StatCard
          label="DAU"
          value={botStats.dau}
          color="#3b82f6"
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
        <StatCard
          label="Сообщений сегодня"
          value={botStats.messagesToday}
          color="#a78bfa"
          icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </div>

      {/* Bot settings */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            Настройки бота
          </h3>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            style={{
              ...btnPrimary,
              padding: "8px 16px",
              fontSize: 13,
              background: settingsSaved ? "#10b981" : btnPrimary.background,
              opacity: savingSettings ? 0.5 : 1,
            }}
          >
            {savingSettings ? "Сохраняем..." : settingsSaved ? "Сохранено!" : "Сохранить"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Приветственное сообщение</label>
            <textarea
              value={settings.welcome_message}
              onChange={(e) => setSettings((prev) => ({ ...prev, welcome_message: e.target.value }))}
              placeholder="Привет! Я бот BodyComp. Помогу тебе следить за составом тела..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Текст ежедневного напоминания</label>
            <textarea
              value={settings.daily_reminder}
              onChange={(e) => setSettings((prev) => ({ ...prev, daily_reminder: e.target.value }))}
              placeholder="Не забудь проверить свои показатели! Пройди калькулятор..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Расписание отправки уроков</label>
            <input
              type="text"
              value={settings.lesson_schedule}
              onChange={(e) => setSettings((prev) => ({ ...prev, lesson_schedule: e.target.value }))}
              placeholder="Каждый день в 10:00 / Пн, Ср, Пт в 09:00"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Уведомление за день до DXA</label>
            <textarea
              value={settings.notify_before_dxa}
              onChange={(e) => setSettings((prev) => ({ ...prev, notify_before_dxa: e.target.value }))}
              placeholder="Завтра у вас DXA-сканирование! Не забудьте..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Уведомление после DXA</label>
            <textarea
              value={settings.notify_after_dxa}
              onChange={(e) => setSettings((prev) => ({ ...prev, notify_after_dxa: e.target.value }))}
              placeholder="Вы прошли DXA! Ваши результаты готовы. Сравните с калькулятором..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
