import { colors, fonts, inputStyle } from "../styles";

// Simple markdown to HTML converter
function markdownToHtml(md) {
  if (!md) return "";
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold / italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#22d3ee">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  // Wrap in paragraph tags
  html = `<p>${html}</p>`;

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul>${match}</ul>`);

  return html;
}

export default function ContentEditor({ value, onChange, height = 300 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Editor */}
      <div>
        <div style={{
          fontSize: 11, color: colors.textDim, fontFamily: fonts.mono,
          marginBottom: 6, letterSpacing: "0.04em",
        }}>
          MARKDOWN
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputStyle,
            height,
            resize: "vertical",
            fontFamily: fonts.mono,
            fontSize: 13,
            lineHeight: 1.6,
          }}
          onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
          onBlur={(e) => { e.target.style.borderColor = colors.borderLight; }}
          placeholder="# Заголовок\n\nТекст параграфа с **жирным** и *курсивом*.\n\n- Пункт списка\n- Ещё пункт"
        />
      </div>

      {/* Preview */}
      <div>
        <div style={{
          fontSize: 11, color: colors.textDim, fontFamily: fonts.mono,
          marginBottom: 6, letterSpacing: "0.04em",
        }}>
          ПРЕВЬЮ
        </div>
        <div
          style={{
            height,
            overflow: "auto",
            padding: 16,
            borderRadius: 10,
            background: colors.bg,
            border: `1.5px solid ${colors.border}`,
            color: colors.text,
            fontSize: 14,
            fontFamily: fonts.body,
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        />
      </div>
    </div>
  );
}
