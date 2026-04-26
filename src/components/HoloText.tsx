import { useCurrentFrame } from "remotion";
import { theme } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const HoloText: React.FC<Props> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const shift = (frame * 1.4) % 200;

  return (
    <span
      style={{
        backgroundImage: `linear-gradient(110deg, ${theme.holoA}, ${theme.holoD}, ${theme.holoC}, ${theme.holoB}, ${theme.holoA})`,
        backgroundSize: "200% auto",
        backgroundPositionX: `${shift}%`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const GoldText: React.FC<Props> = ({ children, style }) => {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(120deg, ${theme.gold}, ${theme.goldSoft}, ${theme.goldDark})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
