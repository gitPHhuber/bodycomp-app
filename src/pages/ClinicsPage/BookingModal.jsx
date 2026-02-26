import { useState } from "react";

export default function BookingModal({ clinic, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1=date, 2=time, 3=info, 4=done
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d;
  });

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const monthNames = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

  const formatDate = (d) => `${d.getDate()} ${monthNames[d.getMonth()]}`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "#000a", backdropFilter: "blur(8px)" }} />
      <div
        style={{
          position: "relative", width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflow: "auto",
          background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
          borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
          animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#334155", margin: "0 auto 20px" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{clinic.img}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{clinic.name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{clinic.city} · {clinic.device}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "#1e293b", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "#22d3ee" : "#1e293b", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Step 1: Date */}
        {step === 1 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Выберите дату</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20, WebkitOverflowScrolling: "touch" }}>
              {dates.map((d, i) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const isSel = selectedDate && d.toDateString() === selectedDate.toDateString();
                return (
                  <button key={i} onClick={() => setSelectedDate(d)} style={{
                    flexShrink: 0, width: 64, padding: "10px 6px", borderRadius: 14, textAlign: "center", cursor: "pointer",
                    background: isSel ? "#22d3ee" : "#0f172a",
                    border: `1.5px solid ${isSel ? "#22d3ee" : "#1e293b"}`,
                    color: isSel ? "#020617" : isWeekend ? "#ef4444" : "#e2e8f0",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{dayNames[d.getDay()]}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0" }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10 }}>{monthNames[d.getMonth()]}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => selectedDate && setStep(2)}
              disabled={!selectedDate}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedDate ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedDate ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedDate ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >Далее →</button>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(1)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>←</button>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Выберите время</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{formatDate(selectedDate)}, {dayNames[selectedDate.getDay()]}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {clinic.slots.map((t, i) => {
                const isSel = selectedTime === t;
                return (
                  <button key={i} onClick={() => setSelectedTime(t)} style={{
                    padding: "14px 8px", borderRadius: 12, textAlign: "center", cursor: "pointer",
                    background: isSel ? "#22d3ee" : "#0f172a",
                    border: `1.5px solid ${isSel ? "#22d3ee" : "#1e293b"}`,
                    color: isSel ? "#020617" : "#e2e8f0",
                    fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                    transition: "all 0.2s",
                  }}>{t}</button>
                );
              })}
            </div>
            <button
              onClick={() => selectedTime && setStep(3)}
              disabled={!selectedTime}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedTime ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedTime ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedTime ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >Далее →</button>
          </div>
        )}

        {/* Step 3: Contact info */}
        {step === 3 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(2)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>←</button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Ваши данные</div>
            </div>

            {/* Summary */}
            <div style={{ padding: 14, borderRadius: 14, background: "#020617", border: "1px solid #1e293b", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Клиника</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{clinic.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Дата</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{formatDate(selectedDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Время</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Стоимость</span>
                <div>
                  <span style={{ fontSize: 15, color: "#22d3ee", fontWeight: 700, fontFamily: "mono" }}>₽{clinic.price.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: "#475569", textDecoration: "line-through", marginLeft: 6 }}>₽{clinic.priceOld.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>Телефон</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" type="tel"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>

            <button
              onClick={() => { if (name && phone) { setStep(4); if (onConfirm) onConfirm({ clinic, date: selectedDate, time: selectedTime, name, phone }); } }}
              disabled={!name || !phone}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: name && phone ? "linear-gradient(135deg,#10b981,#34d399)" : "#1e293b",
                color: name && phone ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: name && phone ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: name && phone ? "0 0 30px #10b98122" : "none",
                transition: "all 0.3s",
              }}
            >Подтвердить запись ✓</button>

            <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 10 }}>
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeSlide 0.5s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "bounceIn 0.6s ease" }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg,#e2e8f0,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Запись подтверждена!
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
              {formatDate(selectedDate)} в {selectedTime}<br />
              {clinic.name}, {clinic.city}<br />
              {clinic.address}
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: "#10b98112", border: "1px solid #10b98133", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>📋 Подготовка к DXA:</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.8 }}>
                • Наденьте удобную одежду без металла<br />
                • Не принимайте кальций за 24 часа<br />
                • Возьмите паспорт<br />
                • Процедура занимает ~5 минут
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, border: "none", borderRadius: 12,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "mono",
              }}>Готово</button>
              <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 48, borderRadius: 12, background: "#1e293b",
                border: "1px solid #334155", textDecoration: "none", fontSize: 18,
              }}>📞</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
