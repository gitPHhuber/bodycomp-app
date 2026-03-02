import { colors, fonts, inputStyle, labelStyle, btnSecondary } from "../styles";

export default function QuizBuilder({ questions, onChange }) {
  const update = (idx, field, value) => {
    const next = [...questions];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const next = [...questions];
    const opts = [...next[qIdx].options];
    opts[optIdx] = value;
    next[qIdx] = { ...next[qIdx], options: opts };
    onChange(next);
  };

  const addQuestion = () => {
    onChange([...questions, { text: "", options: ["", "", "", ""], correct: 0, explanation: "" }]);
  };

  const removeQuestion = (idx) => {
    onChange(questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    const next = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <div style={{
        fontSize: 11, color: colors.textDim, fontFamily: fonts.mono,
        marginBottom: 12, letterSpacing: "0.04em",
      }}>
        ВОПРОСЫ КВИЗА ({questions.length})
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} style={{
          padding: 20,
          borderRadius: 12,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          marginBottom: 12,
        }}>
          {/* Question header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: colors.accent, fontFamily: fonts.mono, fontWeight: 600 }}>
              Вопрос {qIdx + 1}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => moveQuestion(qIdx, -1)}
                disabled={qIdx === 0}
                style={smallBtn(qIdx === 0)}
                title="Вверх"
              >
                ↑
              </button>
              <button
                onClick={() => moveQuestion(qIdx, 1)}
                disabled={qIdx === questions.length - 1}
                style={smallBtn(qIdx === questions.length - 1)}
                title="Вниз"
              >
                ↓
              </button>
              <button
                onClick={() => removeQuestion(qIdx)}
                style={{
                  ...smallBtn(false),
                  borderColor: "#991b1b",
                  color: "#fca5a5",
                }}
                title="Удалить"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Question text */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              value={q.text}
              onChange={(e) => update(qIdx, "text", e.target.value)}
              placeholder="Текст вопроса..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="radio"
                  name={`correct-${qIdx}`}
                  checked={q.correct === optIdx}
                  onChange={() => update(qIdx, "correct", optIdx)}
                  style={{ accentColor: colors.success, cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                  placeholder={`Вариант ${optIdx + 1}`}
                  style={{
                    ...inputStyle,
                    borderColor: q.correct === optIdx ? colors.success : colors.borderLight,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                  onBlur={(e) => { e.target.style.borderColor = q.correct === optIdx ? colors.success : colors.borderLight; }}
                />
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <label style={{ ...labelStyle, fontSize: 10 }}>Пояснение (показывается после ответа)</label>
            <input
              type="text"
              value={q.explanation}
              onChange={(e) => update(qIdx, "explanation", e.target.value)}
              placeholder="Почему этот ответ правильный..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
            />
          </div>
        </div>
      ))}

      <button onClick={addQuestion} style={{ ...btnSecondary, width: "100%" }}>
        + Добавить вопрос
      </button>
    </div>
  );
}

function smallBtn(disabled) {
  return {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    background: "transparent",
    color: disabled ? colors.textDark : colors.textMuted,
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.mono,
  };
}
