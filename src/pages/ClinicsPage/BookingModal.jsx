import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import * as tracker from "../../lib/tracker";

const FORMSPREE_URL = import.meta.env.VITE_FORMSPREE_URL;

export default function BookingModal({ clinic, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1=date, 2=time, 3=info, 4=done

  const isRepeat = window.location.pathname === '/repeat-dxa'
    || new URLSearchParams(window.location.search).get('scan_type') === 'repeat';
  const scanType = isRepeat ? 'repeat' : 'primary';

  useEffect(() => {
    tracker.trackBookingFormOpen(clinic.id, window.location.pathname);
  }, []);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d;
  });

  const dayNames = ["\u0412\u0441", "\u041f\u043d", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041f\u0442", "\u0421\u0431"];
  const monthNames = ["\u044f\u043d\u0432", "\u0444\u0435\u0432", "\u043c\u0430\u0440", "\u0430\u043f\u0440", "\u043c\u0430\u0439", "\u0438\u044e\u043d", "\u0438\u044e\u043b", "\u0430\u0432\u0433", "\u0441\u0435\u043d", "\u043e\u043a\u0442", "\u043d\u043e\u044f", "\u0434\u0435\u043a"];

  const formatDate = (d) => `${d.getDate()} ${monthNames[d.getMonth()]}`;

  const handleSubmit = async () => {
    if (!name || !phone || submitting) return;
    tracker.trackBookingStep("contact", clinic.id);
    setSubmitting(true);
    setSubmitError(null);

    const utmParams = tracker.getUtmParams();
    const payload = {
      clinic_id: null,
      clinic_name: clinic.name,
      city: clinic.city,
      date: selectedDate.toISOString(),
      time: selectedTime,
      name,
      phone,
      session_id: tracker.getSessionId(),
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      source_page: window.location.pathname,
      scan_type: scanType,
      offer_variant: null,
      coupon_code: null,
    };

    try {
      let bookingId = null;
      if (supabase) {
        const { data, error } = await supabase.from("bookings").insert(payload).select('id').single();
        if (error) throw error;
        bookingId = data?.id || null;
      } else if (FORMSPREE_URL) {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Formspree error");
      } else {
        throw new Error("No submission backend configured");
      }

      tracker.trackBookingStep("confirm", clinic.id);
      tracker.trackLeadCreated({
        clinic_id: clinic.id,
        scan_type: scanType,
        offer_variant: null,
        coupon_code: null,
        session_id: tracker.getSessionId(),
      });

      setStep(4);
      if (onConfirm) onConfirm({ clinic, date: selectedDate, time: selectedTime, name, phone, bookingId });
    } catch {
      setSubmitError("\u041e\u0448\u0438\u0431\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasPrice = clinic.price > 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "#000a", backdropFilter: "blur(8px)" }} />
      <div
        style={{
          position: "relative", width: "100%", maxWidth: 640,
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
            <div style={{ fontSize: 12, color: "#64748b" }}>{clinic.city}{clinic.device ? ` \u00b7 ${clinic.device}` : ""}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "#1e293b", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 16 }}>\u2715</button>
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
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443"}</div>
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
              onClick={() => { if (selectedDate) { tracker.trackBookingStep("date", clinic.id); setStep(2); } }}
              disabled={!selectedDate}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedDate ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedDate ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedDate ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >{"\u0414\u0430\u043b\u0435\u0435 \u2192"}</button>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(1)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>{"\u2190"}</button>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0440\u0435\u043c\u044f"}</div>
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
              onClick={() => { if (selectedTime) { tracker.trackBookingStep("time", clinic.id); setStep(3); } }}
              disabled={!selectedTime}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: selectedTime ? "linear-gradient(135deg,#0891b2,#22d3ee)" : "#1e293b",
                color: selectedTime ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: selectedTime ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace", transition: "all 0.3s",
              }}
            >{"\u0414\u0430\u043b\u0435\u0435 \u2192"}</button>
          </div>
        )}

        {/* Step 3: Contact info */}
        {step === 3 && (
          <div style={{ animation: "fadeSlide 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setStep(2)} style={{ background: "#1e293b", border: "none", color: "#94a3b8", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>{"\u2190"}</button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{"\u0412\u0430\u0448\u0438 \u0434\u0430\u043d\u043d\u044b\u0435"}</div>
            </div>

            {/* Summary */}
            <div style={{ padding: 14, borderRadius: 14, background: "#020617", border: "1px solid #1e293b", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{"\u041a\u043b\u0438\u043d\u0438\u043a\u0430"}</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{clinic.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{"\u0414\u0430\u0442\u0430"}</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{formatDate(selectedDate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{"\u0412\u0440\u0435\u043c\u044f"}</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{"\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c"}</span>
                {hasPrice ? (
                  <div>
                    <span style={{ fontSize: 15, color: "#22d3ee", fontWeight: 700, fontFamily: "mono" }}>{"\u20bd"}{clinic.price.toLocaleString()}</span>
                    {clinic.priceOld && (
                      <span style={{ fontSize: 12, color: "#475569", textDecoration: "line-through", marginLeft: 6 }}>{"\u20bd"}{clinic.priceOld.toLocaleString()}</span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>
                    {clinic.priceLabel || "\u0423\u0442\u043e\u0447\u043d\u044f\u0439\u0442\u0435 \u043f\u043e \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0443"}
                  </span>
                )}
              </div>
            </div>

            {/* Inputs */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>{"\u0418\u043c\u044f"}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={"\u0412\u0430\u0448\u0435 \u0438\u043c\u044f"}
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontFamily: "mono" }}>{"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" type="tel"
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: 12, color: "#fff", fontSize: 16, outline: "none", fontFamily: "'Outfit',sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#22d3ee"} onBlur={e => e.target.style.borderColor = "#334155"} />
            </div>

            <button



              onClick={async () => {
                tracker.trackClick("booking_step_contact", { clinicId: clinic.id });
                if (!name || !phone || submitting) return;
                setSubmitting(true);
                setSubmitError(null);
                const utm = tracker.getUtmParams();
                const payload = {
                  session_id: tracker.getSessionId(),
                  name,
                  phone,
                  clinic_id: clinic.id,
                  clinic_name: clinic.name,
                  desired_date: selectedDate.toISOString().slice(0, 10),
                  desired_time: selectedTime,
                  utm_source: utm.utm_source || null,
                  utm_medium: utm.utm_medium || null,
                  utm_campaign: utm.utm_campaign || null,
                  utm_content: utm.utm_content || null,
                  source_page: window.location.href,
                  referrer: document.referrer || null,
                  status: 'lead',
                };
                try {
                  if (supabase) {
                    const { error } = await supabase.from("bookings").insert(payload);
                    if (error) throw error;
                  } else {
                    const res = await fetch(FORMSPREE_URL, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error("Formspree error");
                  }
                  setStep(4);
                  if (onConfirm) onConfirm({ clinic, date: selectedDate, time: selectedTime, name, phone });
                } catch {
                  setSubmitError("Ошибка отправки. Попробуйте ещё раз.");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!name || !phone || submitting}
              style={{
                width: "100%", padding: 16, border: "none", borderRadius: 14,
                background: name && phone && !submitting ? "linear-gradient(135deg,#10b981,#34d399)" : "#1e293b",
                color: name && phone && !submitting ? "#020617" : "#475569",
                fontSize: 15, fontWeight: 700, cursor: name && phone && !submitting ? "pointer" : "default",
                fontFamily: "'JetBrains Mono',monospace",
                boxShadow: name && phone && !submitting ? "0 0 30px #10b98122" : "none",
                transition: "all 0.3s",
              }}
            >{submitting ? "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c..." : "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c \u2713"}</button>

            {submitError && (
              <p style={{ fontSize: 13, color: "#f87171", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
                {submitError}
              </p>
            )}

            <p style={{ fontSize: 11, color: "#334155", textAlign: "center", marginTop: 10 }}>
              {"\u041d\u0430\u0436\u0438\u043c\u0430\u044f \u043a\u043d\u043e\u043f\u043a\u0443, \u0432\u044b \u0441\u043e\u0433\u043b\u0430\u0448\u0430\u0435\u0442\u0435\u0441\u044c \u0441 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u043e\u0439 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445"}
            </p>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeSlide 0.5s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: "bounceIn 0.6s ease" }}>{"\u2705"}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg,#e2e8f0,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {"\u0417\u0430\u044f\u0432\u043a\u0430 \u043f\u0440\u0438\u043d\u044f\u0442\u0430!"}
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 20 }}>
              {formatDate(selectedDate)} {"\u0432"} {selectedTime}<br />
              {clinic.name}, {clinic.city}<br />
              {clinic.address}
            </div>

            <div style={{ padding: 16, borderRadius: 14, background: "#10b98112", border: "1px solid #10b98133", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>{"\ud83d\udccb \u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u043a DXA:"}</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.8 }}>
                {"\u2022 \u041d\u0430\u0434\u0435\u043d\u044c\u0442\u0435 \u0443\u0434\u043e\u0431\u043d\u0443\u044e \u043e\u0434\u0435\u0436\u0434\u0443 \u0431\u0435\u0437 \u043c\u0435\u0442\u0430\u043b\u043b\u0430"}<br />
                {"\u2022 \u041d\u0435 \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0439\u0442\u0435 \u043a\u0430\u043b\u044c\u0446\u0438\u0439 \u0437\u0430 24 \u0447\u0430\u0441\u0430"}<br />
                {"\u2022 \u0412\u043e\u0437\u044c\u043c\u0438\u0442\u0435 \u043f\u0430\u0441\u043f\u043e\u0440\u0442"}<br />
                {"\u2022 \u041f\u0440\u043e\u0446\u0435\u0434\u0443\u0440\u0430 \u0437\u0430\u043d\u0438\u043c\u0430\u0435\u0442 ~5 \u043c\u0438\u043d\u0443\u0442"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: 14, border: "none", borderRadius: 12,
                background: "linear-gradient(135deg,#0891b2,#22d3ee)",
                color: "#020617", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "mono",
              }}>{"\u0413\u043e\u0442\u043e\u0432\u043e"}</button>
              {clinic.phone && (
                <a href={`tel:${clinic.phone.replace(/\D/g, "")}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 48, borderRadius: 12, background: "#1e293b",
                  border: "1px solid #334155", textDecoration: "none", fontSize: 18,
                }}>{"\ud83d\udcde"}</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
