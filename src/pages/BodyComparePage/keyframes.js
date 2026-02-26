export const CSS_KEYFRAMES = `
@keyframes bcAnnotSlideR {
  from { opacity:0; transform:translateX(24px); }
  to { opacity:1; transform:translateX(0); }
}
@keyframes bcAnnotSlideL {
  from { opacity:0; transform:translateX(-24px); }
  to { opacity:1; transform:translateX(0); }
}
@keyframes bcVerdictIn {
  from { opacity:0; transform:translateY(18px) scale(0.9); }
  to { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes bcPopIn {
  0% { transform:scale(0); }
  50% { transform:scale(1.35); }
  100% { transform:scale(1); }
}
@keyframes bcShimmer {
  0% { background-position:-200px 0; }
  100% { background-position:200px 0; }
}
@keyframes bcPulseGlow {
  0%,100% { filter:drop-shadow(0 0 4px currentColor); opacity:0.8; }
  50% { filter:drop-shadow(0 0 14px currentColor); opacity:1; }
}
@keyframes bcPulseVisceral {
  0%,100% { opacity:0.45; }
  50% { opacity:0.75; }
}
@keyframes bcScanDot {
  0%,100% { r:3; opacity:0.7; }
  50% { r:5; opacity:1; }
}
@keyframes bcFloat {
  0%,100% { transform:translateY(0); }
  50% { transform:translateY(-7px); }
}
`;
