import { Img, staticFile } from "remotion";
import { theme } from "../theme";

type Props = {
  src: string;
  height?: number;
  rotate?: number;
};

const SCREEN_ASPECT = 1080 / 1740;

const dims = (totalHeight: number) => {
  const frameThickness = Math.max(8, Math.round(totalHeight * 0.014));
  const screenHeight = totalHeight - frameThickness * 2;
  const statusH = Math.round(screenHeight * 0.058);
  const homeH = Math.round(screenHeight * 0.024);
  const contentH = screenHeight - statusH - homeH;
  const screenWidth = contentH * SCREEN_ASPECT;
  const totalWidth = screenWidth + frameThickness * 2;
  const outerRadius = Math.round(totalHeight * 0.078);
  const innerRadius = Math.max(8, outerRadius - frameThickness);
  return { frameThickness, screenHeight, statusH, homeH, contentH, screenWidth, totalWidth, outerRadius, innerRadius };
};

export const phoneWidthFromHeight = (height: number) => dims(height).totalWidth;

export const PhoneMock: React.FC<Props> = ({ src, height = 880, rotate = 0 }) => {
  const D = dims(height);

  return (
    <div
      style={{
        width: D.totalWidth,
        height,
        position: "relative",
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 50px 80px rgba(0, 0, 0, 0.55))",
      }}
    >
      <SideButton side="left" topPct={0.205} heightPct={0.052} thickness={D.frameThickness} />
      <SideButton side="left" topPct={0.305} heightPct={0.078} thickness={D.frameThickness} />
      <SideButton side="left" topPct={0.405} heightPct={0.078} thickness={D.frameThickness} />
      <SideButton side="right" topPct={0.27} heightPct={0.105} thickness={D.frameThickness} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: D.outerRadius,
          background: `linear-gradient(135deg, #44444c 0%, #2a2a30 18%, #1a1a1f 50%, #2a2a30 82%, #44444c 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 0 0 ${Math.max(2, D.frameThickness * 0.18)}px rgba(0, 0, 0, 0.4)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: D.frameThickness,
          left: D.frameThickness,
          width: D.screenWidth,
          height: D.screenHeight,
          borderRadius: D.innerRadius,
          background: "#06060a",
          overflow: "hidden",
          boxShadow: `inset 0 0 0 1px rgba(0, 0, 0, 0.9)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StatusBar height={D.statusH} width={D.screenWidth} />
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: D.contentH,
            objectFit: "cover",
            objectPosition: "top",
            display: "block",
          }}
        />
        <HomeIndicator height={D.homeH} width={D.screenWidth} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: D.innerRadius,
            background: `linear-gradient(105deg, rgba(255, 255, 255, 0.04) 0%, transparent 18%, transparent 80%, rgba(255, 255, 255, 0.025) 100%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

const SideButton: React.FC<{
  side: "left" | "right";
  topPct: number;
  heightPct: number;
  thickness: number;
}> = ({ side, topPct, heightPct, thickness }) => {
  const buttonWidth = Math.max(3, thickness * 0.35);
  const stickout = Math.max(2, thickness * 0.18);
  return (
    <div
      style={{
        position: "absolute",
        top: `${topPct * 100}%`,
        height: `${heightPct * 100}%`,
        [side]: -stickout,
        width: buttonWidth,
        borderRadius: side === "left" ? `2px 0 0 2px` : `0 2px 2px 0`,
        background: `linear-gradient(${side === "left" ? "90deg" : "270deg"}, #1a1a1f 0%, #3a3a42 60%, #2a2a30 100%)`,
        boxShadow: side === "left"
          ? `inset 1px 0 0 rgba(255, 255, 255, 0.08)`
          : `inset -1px 0 0 rgba(255, 255, 255, 0.08)`,
      }}
      aria-hidden
    />
  );
};

const StatusBar: React.FC<{ height: number; width: number }> = ({ height, width }) => {
  const fontSize = height * 0.36;
  const notchWidth = width * 0.46;
  const notchHeight = height * 0.66;
  const notchRadius = Math.min(notchHeight * 0.42, 22);
  const speakerW = notchWidth * 0.36;
  const speakerH = Math.max(3, notchHeight * 0.13);
  const cameraSize = Math.max(6, notchHeight * 0.3);

  return (
    <div
      style={{
        height,
        flex: "0 0 auto",
        position: "relative",
        background: "#06060a",
        zIndex: 2,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: width * 0.07,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.fg,
          fontSize,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 600,
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        9:41
      </span>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: notchWidth,
          height: notchHeight,
          background: "#000",
          borderRadius: `0 0 ${notchRadius}px ${notchRadius}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: notchWidth * 0.07,
          paddingTop: notchHeight * 0.08,
        }}
        aria-hidden
      >
        <div
          style={{
            width: speakerW,
            height: speakerH,
            borderRadius: 999,
            background: "#1a1a1f",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
          }}
        />
        <div
          style={{
            width: cameraSize,
            height: cameraSize,
            borderRadius: 999,
            background: "radial-gradient(circle at 35% 35%, #0e3548 0%, #061820 70%, #000 100%)",
            boxShadow: "inset 0 0 0 1px rgba(120, 200, 230, 0.18)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          right: width * 0.07,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: height * 0.12,
        }}
      >
        <SignalBars size={fontSize * 0.95} color={theme.fg} />
        <Wifi size={fontSize * 0.95} color={theme.fg} />
        <Battery size={fontSize * 1.5} color={theme.fg} />
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
          background: "rgba(244, 242, 234, 0.85)",
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
