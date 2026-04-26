import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";

export const SellerDash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 22 } });
  const exit = interpolate(frame, [125, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const float = Math.sin(frame * 0.06 + 2) * 6;
  const phoneShift = interpolate(enter, [0, 1], [80, 0]);
  const textShift = interpolate(enter, [0, 1], [-40, 0]);

  // Cross-fade dashboard → analytics around frame 75
  const swap = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 120,
        paddingLeft: 140,
        paddingRight: 140,
      }}
    >
      <div
        style={{
          flex: 1,
          maxWidth: 880,
          transform: `translateX(${textShift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: theme.holoC,
            marginBottom: 28,
          }}
        >
          ✦ For sellers
        </div>

        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 130,
            lineHeight: 1,
            letterSpacing: -3,
            color: theme.fg,
          }}
        >
          Sell with intelligence.
        </div>

        <div
          style={{
            marginTop: 32,
            fontFamily: fonts.sans,
            fontSize: 28,
            lineHeight: 1.45,
            color: theme.fgDim,
            maxWidth: 700,
          }}
        >
          Track active lots, bid velocity, watcher counts, sell-rate, and 30-day averages — every listing analyzed.
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 36,
            fontFamily: fonts.mono,
            color: theme.fg,
          }}
        >
          <Stat label="Sell rate" value="73%" />
          <Stat label="Avg sold (30d)" value="₱18,200" />
          <Stat label="Watchers" value="38" />
        </div>
      </div>

      <div
        style={{
          transform: `translate(${phoneShift}px, ${float}px) rotate(-2deg)`,
          position: "relative",
          width: 433,
          height: 880,
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
          <PhoneMock src="screenshots/dashboard.jpg" height={880} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: swap }}>
          <PhoneMock src="screenshots/analytics.jpg" height={880} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 12,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: theme.fgMuted,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: 56,
        color: theme.fg,
        lineHeight: 1.1,
        marginTop: 4,
      }}
    >
      {value}
    </div>
  </div>
);
