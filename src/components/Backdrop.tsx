import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.15) % 80;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${theme.hairline} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `${drift}px ${drift}px`,
        opacity: 0.6,
      }}
    />
  );
};
