import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CardMock } from "../components/CardMock";
import { theme } from "../theme";

type Feature = {
  eyebrow: string;
  title: string;
  copy: string;
  card: { title: string; rarity: string; price: string; hue: string };
};

const features: Feature[] = [
  {
    eyebrow: "Discover",
    title: "Cards from collectors who care.",
    copy: "Browse verified listings from real collectors — every card photographed, graded, and described.",
    card: { title: "Monkey D. Luffy", rarity: "Super Rare", price: "₱4,200", hue: "#7a1a23" },
  },
  {
    eyebrow: "Trade safely",
    title: "Escrow built in.",
    copy: "Buyers fund. Sellers ship. Payment releases on delivery — no chargebacks, no chasing.",
    card: { title: "Trafalgar Law", rarity: "Leader", price: "₱6,800", hue: "#1f3a5f" },
  },
  {
    eyebrow: "Build your shelf",
    title: "Track every pull.",
    copy: "Catalog your collection, watch market value, and price your binders without second-guessing.",
    card: { title: "Roronoa Zoro", rarity: "Secret Rare", price: "₱9,500", hue: "#2c5934" },
  },
];

export const Features: React.FC = () => {
  return (
    <AbsoluteFill>
      {features.map((feature, i) => (
        <Sequence key={i} from={i * 90} durationInFrames={90}>
          <FeatureSlide feature={feature} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const FeatureSlide: React.FC<{ feature: Feature }> = ({ feature }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 20 } });
  const exit = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const textShift = interpolate(enter, [0, 1], [40, 0]);
  const cardShift = interpolate(enter, [0, 1], [-60, 0]);
  const cardRot = interpolate(enter, [0, 1], [-12, -4]);

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 120,
        padding: "0 200px",
      }}
    >
      <div
        style={{
          transform: `translateX(${cardShift}px) rotate(${cardRot}deg)`,
          opacity,
        }}
      >
        <CardMock {...feature.card} />
      </div>

      <div
        style={{
          maxWidth: 720,
          opacity,
          transform: `translateY(${textShift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: theme.accent,
            marginBottom: 24,
          }}
        >
          {feature.eyebrow}
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 88,
            fontWeight: 600,
            lineHeight: 1.05,
            color: theme.ink,
            letterSpacing: -1.5,
          }}
        >
          {feature.title}
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            lineHeight: 1.5,
            color: theme.muted,
            maxWidth: 620,
          }}
        >
          {feature.copy}
        </div>
      </div>
    </AbsoluteFill>
  );
};
