import { useVideoConfig } from "remotion";

export type Layout = ReturnType<typeof useLayout>;

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;

  return {
    vertical,
    width,
    height,
    phoneHeight: vertical ? 1040 : 880,
    flexDir: vertical ? ("column" as const) : ("row" as const),
    flexDirReverse: vertical ? ("column-reverse" as const) : ("row" as const),
    gap: vertical ? 56 : 120,
    paddingX: vertical ? 80 : 140,
    contentMaxWidth: vertical ? 920 : 880,
    eyebrow: { fontSize: vertical ? 14 : 16, letter: vertical ? 4 : 5 },
    headline: vertical ? 86 : 130,
    headlineHero: vertical ? 110 : 168,
    body: vertical ? 22 : 28,
    pillFont: vertical ? 14 : 18,
    statValue: vertical ? 44 : 56,
    align: vertical ? ("center" as const) : ("flex-start" as const),
    textAlign: vertical ? ("center" as const) : ("left" as const),
  };
};
