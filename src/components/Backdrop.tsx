import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.4) % 6;

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, rgba(255, 215, 0, 0.06), transparent 60%), radial-gradient(120% 80% at 80% 110%, rgba(255, 45, 168, 0.07), transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 0px, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 3px)`,
          backgroundPositionY: `${drift}px`,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
