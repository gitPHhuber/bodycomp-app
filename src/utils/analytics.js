const METRIKA_ID = XXXXXXXX;

export function trackPageView(url) {
  if (typeof window.ym === "function") {
    window.ym(METRIKA_ID, "hit", url);
  }
}

export function trackGoal(goalName) {
  if (typeof window.ym === "function") {
    window.ym(METRIKA_ID, "reachGoal", goalName);
  }
}
