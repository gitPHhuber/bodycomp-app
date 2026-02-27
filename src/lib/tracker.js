import { supabase } from "./supabase";

// ── Session ID ──────────────────────────────────────────────
const SESSION_KEY = "bc_session_id";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── UTM capture ─────────────────────────────────────────────
const UTM_KEY = "bc_utm";
let utmParams = null;

function getUtmParams() {
  if (utmParams) return utmParams;

  const stored = sessionStorage.getItem(UTM_KEY);
  if (stored) {
    utmParams = JSON.parse(stored);
    return utmParams;
  }

  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  const ref = params.get("ref");
  if (ref) utm.ref = ref;

  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
  utmParams = utm;
  return utm;
}

// ── Event queue & batching ──────────────────────────────────
let queue = [];
let flushTimer = null;
const BATCH_INTERVAL = 3000;

function enqueue(eventType, page, element, meta) {
  if (!supabase) return;

  const utm = getUtmParams();
  const enrichedMeta = Object.keys(utm).length > 0 ? { ...meta, utm } : meta || undefined;

  queue.push({
    session_id: getSessionId(),
    event_type: eventType,
    page: page || window.location.pathname,
    element: element || undefined,
    meta: enrichedMeta || undefined,
    source: "website",
  });

  if (!flushTimer) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL);
  }
}

async function flush() {
  flushTimer = null;
  if (queue.length === 0 || !supabase) return;

  const batch = queue.splice(0);

  try {
    await supabase.from("events").insert(batch);
  } catch {
    // Silent failure — tracking must never break the app
  }
}

// ── Flush on page hide / unload ─────────────────────────────
function flushSync() {
  if (queue.length === 0 || !supabase) return;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const batch = queue.splice(0);
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/events`;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    fetch(url, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSync();
  });
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushSync);
}

// ── Debounce helper for high-frequency events ───────────────
const debounceTimers = {};

function debouncedEnqueue(key, eventType, page, element, meta, delay = 5000) {
  if (debounceTimers[key]) return;
  enqueue(eventType, page, element, meta);
  debounceTimers[key] = setTimeout(() => {
    delete debounceTimers[key];
  }, delay);
}

// ── Public API ──────────────────────────────────────────────

export function trackPageView(page) {
  enqueue("page_view", page);
}

export function trackClick(element, meta) {
  enqueue("click", null, element, meta);
}

export function trackCalcStart() {
  enqueue("calc_start", "/analyzer");
}

export function trackCalcComplete(results) {
  enqueue("calc_complete", "/analyzer", null, results);

  // Also save to calc_results table
  if (supabase && results) {
    supabase
      .from("calc_results")
      .insert({
        session_id: getSessionId(),
        height_cm: results.height_cm,
        weight_kg: results.weight_kg,
        age: results.age,
        gender: results.gender,
        waist_cm: results.waist_cm,
        hip_cm: results.hip_cm,
        neck_cm: results.neck_cm,
        fat_pct: results.fat_pct,
        muscle_kg: results.muscle_kg,
        visceral_level: results.visceral_level,
        bmi: results.bmi,
      })
      .then(() => {})
      .catch(() => {});
  }
}

export function trackQuizStart(slug) {
  enqueue("quiz_start", null, null, { slug });
}

export function trackQuizComplete(slug, score, answers) {
  enqueue("quiz_complete", null, null, { slug, score, answers });
}

export function trackBookingClick(clinicId) {
  enqueue("booking_click", "/clinics", null, { clinicId });
}

export function trackShare(type, quizSlug) {
  enqueue("share", null, null, { type, quizSlug });
}

export function trackScrollDepth(page, depth) {
  debouncedEnqueue(`scroll_${page}_${depth}`, "scroll_depth", page, null, { depth });
}

export function track3DInteraction(model, action) {
  debouncedEnqueue(`3d_${model}_${action}`, "model_interact", null, null, { model, action });
}

export function trackTimeOnPage(page, seconds) {
  enqueue("time_on_page", page, null, { seconds });
}
