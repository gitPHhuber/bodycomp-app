const METRIKA_ID = null;

export function trackPageView(url) {
  if (METRIKA_ID && typeof window.ym === "function") {
    window.ym(METRIKA_ID, "hit", url);
  }
}

export function trackGoal(goalName) {
  if (METRIKA_ID && typeof window.ym === "function") {
    window.ym(METRIKA_ID, "reachGoal", goalName);
  }
}
