import { theme } from "../theme";

type Props = {
  title: string;
  rarity: string;
  price: string;
  hue: string;
  rotate?: number;
};

export const CardMock: React.FC<Props> = ({ title, rarity, price, hue, rotate = 0 }) => {
  return (
    <div
      style={{
        width: 280,
        height: 400,
        borderRadius: 18,
        background: `linear-gradient(160deg, ${hue} 0%, ${theme.ink} 100%)`,
        padding: 18,
        boxShadow: "0 30px 60px rgba(11, 11, 15, 0.25)",
        transform: `rotate(${rotate}deg)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: theme.paper,
        fontFamily: "'Inter', sans-serif",
        border: `1px solid rgba(255, 255, 255, 0.08)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: 14,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          {rarity}
        </span>
        <span
          style={{
            fontSize: 14,
            color: theme.gold,
            fontWeight: 600,
          }}
        >
          ★
        </span>
      </div>

      <div
        style={{
          flex: 1,
          margin: "16px 0",
          borderRadius: 10,
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 10px, rgba(255,255,255,0.02) 10px 20px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 16,
            color: theme.gold,
            fontWeight: 600,
          }}
        >
          {price}
        </div>
      </div>
    </div>
  );
};
