import { Img, staticFile } from "remotion";
import { theme } from "../theme";

type Props = {
  src: string;
  height?: number;
  rotate?: number;
};

const SCREEN_ASPECT = 1080 / 1740;

const dims = (height: number) => {
  const statusH = Math.round(height * 0.042);
  const homeH = Math.round(height * 0.024);
  const screenH = height - statusH - homeH;
  const width = screenH * SCREEN_ASPECT;
  return { statusH, homeH, screenH, width };
};

export const phoneWidthFromHeight = (height: number) => dims(height).width;

export const PhoneMock: React.FC<Props> = ({ src, height = 880, rotate = 0 }) => {
  const { statusH, homeH, screenH, width } = dims(height);
  const radius = Math.min(48, height * 0.052);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#06060a",
        boxShadow: `0 40px 90px rgba(0, 0, 0, 0.55), 0 0 0 2px rgba(255, 255, 255, 0.07), 0 0 0 4px rgba(0, 0, 0, 0.6)`,
        transform: `rotate(${rotate}deg)`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <StatusBar height={statusH} width={width} />
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: screenH,
          objectFit: "cover",
          objectPosition: "top",
          display: "block",
        }}
      />
      <HomeIndicator height={homeH} width={width} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          boxShadow: `inset 0 0 80px rgba(0, 0, 0, 0.4)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const StatusBar: React.FC<{ height: number; width: number }> = ({ height, width }) => {
  const fontSize = height * 0.46;
  const islandWidth = width * 0.24;
  const islandHeight = height * 0.6;

  return (
    <div
      style={{
        height,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${width * 0.07}px`,
        background: "#06060a",
        color: theme.fg,
        fontSize,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        position: "relative",
        zIndex: 2,
      }}
    >
      <span style={{ letterSpacing: 0.5, lineHeight: 1 }}>9:41</span>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: islandWidth,
          height: islandHeight,
          borderRadius: 999,
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: height * 0.18 }}>
        <SignalBars size={fontSize * 0.95} color={theme.fg} />
        <Wifi size={fontSize * 0.95} color={theme.fg} />
        <Battery size={fontSize * 1.4} color={theme.fg} />
      </div>
    </div>
  );
};

const HomeIndicator: React.FC<{ height: number; width: number }> = ({ height, width }) => {
  return (
    <div
      style={{
        height,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#06060a",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: width * 0.32,
          height: Math.max(3, height * 0.2),
          borderRadius: 999,
          background: "rgba(244, 242, 234, 0.8)",
        }}
      />
    </div>
  );
};

const SignalBars: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 1.2} height={size} viewBox="0 0 16 12" aria-hidden>
    <rect x="0" y="9" width="2.5" height="3" rx="0.5" fill={color} />
    <rect x="3.5" y="6" width="2.5" height="6" rx="0.5" fill={color} />
    <rect x="7" y="3" width="2.5" height="9" rx="0.5" fill={color} />
    <rect x="10.5" y="0" width="2.5" height="12" rx="0.5" fill={color} />
  </svg>
);

const Wifi: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 1.25} height={size} viewBox="0 0 16 12" aria-hidden>
    <path
      d="M8 11.2 6.4 9.6a2.26 2.26 0 0 1 3.2 0L8 11.2Zm-3.4-3.4-1.4-1.4a6.36 6.36 0 0 1 9 0L10.8 7.8a4.36 4.36 0 0 0-6.2 0Zm-2.6-2.6L0.6 3.8a10.6 10.6 0 0 1 14.8 0L14 5.2a8.6 8.6 0 0 0-12 0Z"
      fill={color}
    />
  </svg>
);

const Battery: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const w = size;
  const h = size * 0.5;
  return (
    <svg width={w + 2} height={h} viewBox={`0 0 ${w + 2} ${h}`} aria-hidden>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx={h * 0.28} fill="none" stroke={color} strokeWidth={1} opacity="0.55" />
      <rect x={w} y={h * 0.3} width="2" height={h * 0.4} rx="1" fill={color} opacity="0.55" />
      <rect x="2" y="2" width={(w - 4) * 0.85} height={h - 4} rx={h * 0.18} fill={color} />
    </svg>
  );
};
