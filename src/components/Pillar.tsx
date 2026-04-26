import { fonts, theme } from "../theme";

type Props = {
  label: string;
  dot?: string;
};

export const Pillar: React.FC<Props> = ({ label, dot = theme.gold }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 999,
        border: `1px solid ${theme.hairline2}`,
        background: "rgba(255, 255, 255, 0.02)",
        fontFamily: fonts.mono,
        fontSize: 16,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color: theme.fgDim,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dot,
          boxShadow: `0 0 12px ${dot}`,
        }}
      />
      {label}
    </div>
  );
};
