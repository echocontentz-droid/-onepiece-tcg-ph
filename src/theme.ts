export const theme = {
  ink: "#0b0b0f",
  paper: "#fafaf7",
  accent: "#e63946",
  gold: "#d4a017",
  muted: "rgba(11, 11, 15, 0.6)",
  hairline: "rgba(11, 11, 15, 0.12)",
} as const;

export const fps = 30;
export const width = 1920;
export const height = 1080;
export const durationInFrames = 750;

export const sceneFrames = {
  intro: { from: 0, length: 120 },
  tagline: { from: 120, length: 150 },
  features: { from: 270, length: 270 },
  cta: { from: 540, length: 120 },
  outro: { from: 660, length: 90 },
} as const;
