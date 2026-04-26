import { fonts, theme } from "../theme";

type Props = {
  size?: number;
  color?: string;
  showSuffix?: boolean;
};

export const Logo: React.FC<Props> = ({ size = 56, color = theme.fg, showSuffix = false }) => {
  const tile = size * 1.05;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
      <div
        style={{
          width: tile,
          height: tile,
          borderRadius: tile * 0.22,
          background: `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 0 1px ${theme.hairline2}`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontSize: tile * 0.62,
            color: "#000",
            lineHeight: 1,
          }}
        >
          C
        </span>
      </div>
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: size,
          color,
          letterSpacing: -size * 0.015,
          lineHeight: 1,
        }}
      >
        Cardhaus
      </span>
      {showSuffix ? (
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: size * 0.32,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: theme.fgMuted,
            marginLeft: size * 0.2,
          }}
        >
          PH
        </span>
      ) : null}
    </div>
  );
};
