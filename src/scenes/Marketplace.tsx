import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";
import { useLayout } from "../useLayout";

export const Marketplace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const enter = spring({ frame, fps, config: { damping: 22 } });
  const exit = interpolate(frame, [95, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const float = Math.sin(frame * 0.06 + 1) * 6;
  const phoneShift = interpolate(enter, [0, 1], [-80, 0]);
  const textShift = interpolate(enter, [0, 1], [40, 0]);

  const phone = (
    <div
      style={{
        transform: `translate(${L.vertical ? 0 : phoneShift}px, ${
          L.vertical ? phoneShift : float
        }px) rotate(${L.vertical ? 0 : 2}deg)`,
      }}
    >
      <PhoneMock src="screenshots/marketplace.jpg" height={L.phoneHeight} />
    </div>
  );

  const copy = (
    <div
      style={{
        flex: L.vertical ? "0 0 auto" : 1,
        maxWidth: L.contentMaxWidth,
        transform: `translateX(${L.vertical ? 0 : textShift}px)`,
        textAlign: L.textAlign,
        display: "flex",
        flexDirection: "column",
        alignItems: L.align,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: L.eyebrow.fontSize,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: theme.gold,
          marginBottom: L.vertical ? 16 : 28,
        }}
      >
        ⚡ Boosted · Pro perk
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: L.vertical ? 76 : 120,
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
          marginTop: L.vertical ? 18 : 32,
          fontFamily: fonts.sans,
          fontSize: L.body,
          lineHeight: 1.45,
          color: theme.fgDim,
          maxWidth: L.vertical ? 880 : 700,
        }}
      >
        One Piece. Pokémon. Magic. Browse live lots from verified PH sellers — graded, photographed, and ready to ship.
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: L.flexDir,
        alignItems: "center",
        justifyContent: "center",
        gap: L.gap,
        paddingLeft: L.paddingX,
        paddingRight: L.paddingX,
      }}
    >
      {phone}
      {copy}
    </AbsoluteFill>
  );
};
