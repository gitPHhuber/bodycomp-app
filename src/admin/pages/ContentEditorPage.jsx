import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { colors, fonts, cardStyle, inputStyle, labelStyle, btnPrimary, btnSecondary } from "../styles";
import ContentEditor from "../components/ContentEditor";
import QuizBuilder from "../components/QuizBuilder";

const TYPES = [
  { value: "lesson", label: "Урок" },
  { value: "quiz", label: "Квиз" },
  { value: "article", label: "Статья" },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => {
      const map = "абвгдежзийклмнопрстуфхцчшщъыьэюя";
      const lat = "abvgdezhziyklmnoprstufhcchshshchyeyuya".split("");
      // Simple transliteration
      const ru = "абвгдеежзиийклмнопрстуфхцчшщъыьэюя";
      const en = ["a","b","v","g","d","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"];
      const idx = ru.indexOf(ch);
      return idx >= 0 ? en[idx] : ch;
    })
    .replace(/ё/g, "yo")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ContentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    type: "lesson",
    title: "",
    slug: "",
    body: "",
    media_url: "",
    sort_order: 0,
    active: false,
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isNew) loadContent();
  }, [id]);

  async function loadContent() {
    if (!supabase) return;
    setLoading(true);

    const { data } = await supabase.from("content").select("*").eq("id", id).single();
    if (data) {
      setForm({
        type: data.type,
        title: data.title,
        slug: data.slug,
        body: data.type === "quiz" ? "" : data.body,
        media_url: data.media_url || "",
        sort_order: data.sort_order,
        active: data.active,
      });

      if (data.type === "quiz") {
        try {
          setQuizQuestions(JSON.parse(data.body) || []);
        } catch {
          setQuizQuestions([]);
        }
      }
    }
    setLoading(false);
  }

  const handleTitleChange = (title) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isNew ? slugify(title) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setSaved(false);

    const body = form.type === "quiz" ? JSON.stringify(quizQuestions) : form.body;

    const payload = {
      type: form.type,
      title: form.title,
      slug: form.slug,
      body,
      media_url: form.media_url || null,
      sort_order: form.sort_order,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { data, error } = await supabase.from("content").insert(payload).select().single();
        if (error) throw error;
        setSaved(true);
        setTimeout(() => navigate(`/admin/content/${data.id}`), 500);
      } else {
        const { error } = await supabase.from("content").update(payload).eq("id", id);
        if (error) throw error;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Ошибка сохранения: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/admin/content")}
            style={{ ...btnSecondary, padding: "8px 16px", fontSize: 13 }}
          >
            ← Назад
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: colors.text, fontFamily: fonts.body, margin: 0 }}>
            {isNew ? "Новый контент" : "Редактирование"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Status toggle */}
          <button
            onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${form.active ? "#10b981" : colors.border}`,
              background: form.active ? "#10b98115" : "transparent",
              color: form.active ? "#10b981" : colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            {form.active ? "Опубликован" : "Черновик"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.slug.trim()}
            style={{
              ...btnPrimary,
              background: saved ? "#10b981" : btnPrimary.background,
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Сохраняем..." : saved ? "Сохранено!" : "Сохранить"}
          </button>
        </div>
      </div>

      {/* Meta fields */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Тип</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Заголовок</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Название материала"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
              style={{ ...inputStyle, fontFamily: fonts.mono, fontSize: 12 }}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Порядок</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              style={{ ...inputStyle, width: 80, textAlign: "center" }}
            />
          </div>
        </div>
        {form.type !== "quiz" && (
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>URL медиа (изображение/видео)</label>
            <input
              type="text"
              value={form.media_url}
              onChange={(e) => setForm((prev) => ({ ...prev, media_url: e.target.value }))}
              placeholder="https://..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>
        )}
      </div>

      {/* Content body */}
      <div style={cardStyle}>
        {form.type === "quiz" ? (
          <QuizBuilder questions={quizQuestions} onChange={setQuizQuestions} />
        ) : (
          <ContentEditor
            value={form.body}
            onChange={(body) => setForm((prev) => ({ ...prev, body }))}
            height={400}
          />
        )}
      </div>
    </div>
  );
}
