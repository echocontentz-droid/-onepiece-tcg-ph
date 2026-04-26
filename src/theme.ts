export const theme = {
  bg: "#06060a",
  ink1: "#0c0c14",
  ink2: "#14141e",
  ink3: "#1c1c28",
  ink4: "#262636",
  fg: "#f4f2ea",
  fgDim: "rgba(244, 242, 234, 0.62)",
  fgMuted: "rgba(244, 242, 234, 0.38)",
  hairline: "rgba(255, 255, 255, 0.08)",
  hairline2: "rgba(255, 255, 255, 0.14)",
  gold: "#ffd700",
  goldDark: "#b8860b",
  goldSoft: "#fff5b8",
  holoA: "#ff2da8",
  holoB: "#00e5ff",
  holoC: "#b5ff2e",
  holoD: "#ffc43a",
  hot: "#ff5470",
  ok: "#8affc1",
} as const;

export const fonts = {
  display: "'Instrument Serif', Georgia, serif",
  sans: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const fps = 30;
export const durationInFrames = 840;

export const sceneFrames = {
  welcome: { from: 0, length: 120 },
  auction: { from: 120, length: 180 },
  marketplace: { from: 300, length: 120 },
  sellerDash: { from: 420, length: 150 },
  handoff: { from: 570, length: 120 },
  cta: { from: 690, length: 150 },
} as const;
