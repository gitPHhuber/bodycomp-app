import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { trackEvent } from "../../lib/tracker";
import { CLINICS } from "../ClinicsPage/data";

const SCAN_TYPES = [
  { value: "initial", label: "Первичное" },
  { value: "repeat", label: "Повторное" },
];

export default function AddDxaResult({ existingResult, onSaved, onClose }) {
  const { profile } = useAuth();
  const isEdit = !!existingResult;

  const [scanDate, setScanDate] = useState(existingResult?.scan_date || "");
  const [clinicName, setClinicName] = useState(existingResult?.clinic_name || "");
  const [customClinic, setCustomClinic] = useState("");
  const [isCustomClinic, setIsCustomClinic] = useState(false);
  const [scanType, setScanType] = useState(existingResult?.scan_type || "initial");
  const [fatPct, setFatPct] = useState(existingResult?.fat_pct ?? "");
  const [muscleMass, setMuscleMass] = useState(existingResult?.muscle_mass_kg ?? "");
  const [boneMass, setBoneMass] = useState(existingResult?.bone_mass_kg ?? "");
  const [visceralFat, setVisceralFat] = useState(existingResult?.visceral_fat_area ?? "");
  const [tScoreSpine, setTScoreSpine] = useState(existingResult?.t_score_spine ?? "");
  const [tScoreHip, setTScoreHip] = useState(existingResult?.t_score_hip ?? "");
  const [notes, setNotes] = useState(existingResult?.notes || "");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Initialize custom clinic from existing result if not in CLINICS list
  useState(() => {
    if (existingResult?.clinic_name) {
      const found = CLINICS.some((c) => c.name === existingResult.clinic_name);
      if (!found) {
        setIsCustomClinic(true);
        setCustomClinic(existingResult.clinic_name);
        setClinicName("__custom__");
      }
    }
  });

  function handleClinicChange(val) {
    if (val === "__custom__") {
      setClinicName("__custom__");
      setIsCustomClinic(true);
    } else {
      setClinicName(val);
      setIsCustomClinic(false);
      setCustomClinic("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase || !profile || saving) return;
    if (!scanDate) { setError("Укажите дату исследования"); return; }

    setSaving(true);
    setError("");

    try {
      let reportUrl = existingResult?.report_url || null;

      // Upload PDF if selected
      if (pdfFile) {
        setUploading(true);
        const ext = pdfFile.name.split(".").pop();
        const path = `${profile.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("dxa-reports")
          .upload(path, pdfFile, { contentType: pdfFile.type });
        if (uploadErr) {
          setError("Ошибка загрузки файла: " + uploadErr.message);
          setSaving(false);
          setUploading(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("dxa-reports").getPublicUrl(path);
        reportUrl = urlData?.publicUrl || null;
        setUploading(false);
      }

      const resolvedClinic = isCustomClinic ? customClinic.trim() : clinicName;

      const row = {
        user_id: profile.id,
        scan_date: scanDate,
        clinic_name: resolvedClinic || null,
        scan_type: scanType,
        fat_pct: fatPct !== "" ? Number(fatPct) : null,
        muscle_mass_kg: muscleMass !== "" ? Number(muscleMass) : null,
        bone_mass_kg: boneMass !== "" ? Number(boneMass) : null,
        visceral_fat_area: visceralFat !== "" ? Number(visceralFat) : null,
        t_score_spine: tScoreSpine !== "" ? Number(tScoreSpine) : null,
        t_score_hip: tScoreHip !== "" ? Number(tScoreHip) : null,
        report_url: reportUrl,
        notes: notes.trim() || null,
      };

      if (isEdit) {
        const { error: updateErr } = await supabase
          .from("dxa_results")
          .update(row)
          .eq("id", existingResult.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("dxa_results")
          .insert(row);
        if (insertErr) throw insertErr;
        trackEvent("dxa_result_added", { scan_type: scanType, source: "manual" });
      }

      onSaved?.();
    } catch (err) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  // ── Styles ──
  const overlay = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  };

  const modal = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    border: "1px solid #334155", borderRadius: "20px 20px 0 0",
    padding: "24px 20px 32px", width: "100%", maxWidth: 520,
    maxHeight: "90dvh", overflowY: "auto",
    color: "#e2e8f0", fontFamily: "'Outfit', 'Manrope', sans-serif",
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "14px 16px",
    background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12,
    color: "#fff", fontSize: 16, outline: "none",
    fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: 12, color: "#64748b", display: "block", marginBottom: 6,
    fontFamily: "'JetBrains Mono', monospace",
  };

  const btnPrimary = {
    width: "100%", padding: 16, border: "none", borderRadius: 14,
    background: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
    color: "#020617", fontSize: 16, fontWeight: 700, cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: "0 0 30px #22d3ee33",
  };

  const fieldGap = { marginBottom: 16 };

  function focusBorder(e) { e.target.style.borderColor = "#22d3ee"; }
  function blurBorder(e) { e.target.style.borderColor = "#334155"; }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
            {isEdit ? "Редактировать результат" : "Добавить результат DXA"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#64748b",
            fontSize: 24, cursor: "pointer", lineHeight: 1,
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div style={fieldGap}>
            <label style={labelStyle}>Дата исследования *</label>
            <input
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
              required
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={focusBorder} onBlur={blurBorder}
            />
          </div>

          {/* Clinic */}
          <div style={fieldGap}>
            <label style={labelStyle}>Клиника</label>
            <select
              value={isCustomClinic ? "__custom__" : clinicName}
              onChange={(e) => handleClinicChange(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={focusBorder} onBlur={blurBorder}
            >
              <option value="">Не указана</option>
              {CLINICS.map((c) => (
                <option key={c.id} value={c.name}>{c.name} — {c.city}</option>
              ))}
              <option value="__custom__">Другая клиника...</option>
            </select>
            {isCustomClinic && (
              <input
                type="text"
                value={customClinic}
                onChange={(e) => setCustomClinic(e.target.value)}
                placeholder="Название клиники"
                style={{ ...inputStyle, marginTop: 8 }}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            )}
          </div>

          {/* Scan type */}
          <div style={fieldGap}>
            <label style={labelStyle}>Тип исследования</label>
            <div style={{ display: "flex", gap: 8 }}>
              {SCAN_TYPES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setScanType(st.value)}
                  style={{
                    flex: 1, padding: "10px 12px", border: "1.5px solid",
                    borderColor: scanType === st.value ? "#22d3ee" : "#334155",
                    borderRadius: 10,
                    background: scanType === st.value ? "#22d3ee11" : "#0f172a",
                    color: scanType === st.value ? "#22d3ee" : "#94a3b8",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Жир, %</label>
              <input type="number" step="0.1" value={fatPct} onChange={(e) => setFatPct(e.target.value)}
                placeholder="24.3" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>Мышцы, кг</label>
              <input type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)}
                placeholder="58.2" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>Кости, кг</label>
              <input type="number" step="0.1" value={boneMass} onChange={(e) => setBoneMass(e.target.value)}
                placeholder="2.8" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>Висц. жир, см²</label>
              <input type="number" step="0.1" value={visceralFat} onChange={(e) => setVisceralFat(e.target.value)}
                placeholder="85" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>T-score позв.</label>
              <input type="number" step="0.1" value={tScoreSpine} onChange={(e) => setTScoreSpine(e.target.value)}
                placeholder="-0.5" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}>T-score бедро</label>
              <input type="number" step="0.1" value={tScoreHip} onChange={(e) => setTScoreHip(e.target.value)}
                placeholder="-0.3" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* PDF upload */}
          <div style={fieldGap}>
            <label style={labelStyle}>PDF-отчёт</label>
            <label style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 16px", background: "#0f172a",
              border: "1.5px dashed #334155", borderRadius: 12,
              cursor: "pointer", color: "#94a3b8", fontSize: 14,
              transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span>{pdfFile ? pdfFile.name : "Выберите файл..."}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
            </label>
            {existingResult?.report_url && !pdfFile && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                Текущий файл загружен. Выберите новый для замены.
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={fieldGap}>
            <label style={labelStyle}>Заметки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Комментарии к исследованию..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={focusBorder} onBlur={blurBorder}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 12, marginBottom: 16,
              background: "#ef444422", border: "1px solid #ef444444",
              color: "#ef4444", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={saving} style={btnPrimary}>
            {uploading ? "Загрузка файла..." : saving ? "Сохраняем..." : isEdit ? "Сохранить" : "Добавить результат"}
          </button>
        </form>
      </div>
    </div>
  );
}
