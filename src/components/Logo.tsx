import { theme } from "../theme";

type Props = {
  size?: number;
  color?: string;
};

export const Logo: React.FC<Props> = ({ size = 96, color = theme.ink }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.25,
      }}
    >
      <Mark size={size} color={color} />
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
          fontSize: size,
          color,
          letterSpacing: -size * 0.02,
          lineHeight: 1,
        }}
      >
        Cardhaus
      </span>
    </div>
  );
};

const Mark: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const s = size * 1.05;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <rect
        x="18"
        y="10"
        width="48"
        height="72"
        rx="6"
        fill="none"
        stroke={color}
        strokeWidth="4"
        transform="rotate(-8 42 46)"
      />
      <rect
        x="34"
        y="18"
        width="48"
        height="72"
        rx="6"
        fill={color}
        transform="rotate(8 58 54)"
      />
      <circle cx="58" cy="54" r="6" fill={theme.paper} transform="rotate(8 58 54)" />
    </svg>
  );
};
