import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";

export const Marketplace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 22 } });
  const exit = interpolate(frame, [95, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const float = Math.sin(frame * 0.06 + 1) * 6;
  const phoneShift = interpolate(enter, [0, 1], [-80, 0]);
  const textShift = interpolate(enter, [0, 1], [40, 0]);

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
          transform: `translate(${phoneShift}px, ${float}px) rotate(2deg)`,
        }}
      >
        <PhoneMock src="screenshots/marketplace.jpg" height={880} />
      </div>

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
            color: theme.gold,
            marginBottom: 28,
          }}
        >
          ⚡ Boosted · Pro perk
        </div>

        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 120,
            lineHeight: 1,
            letterSpacing: -3,
            color: theme.fg,
          }}
        >
          From <em style={{ fontStyle: "italic" }}>Charizards</em>
          <br />
          to <em style={{ fontStyle: "italic" }}>Mox Sapphires</em>.
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
          One Piece. Pokémon. Magic. Browse live lots from verified PH sellers — graded, photographed, and ready to ship.
        </div>
      </div>
    </AbsoluteFill>
  );
};
