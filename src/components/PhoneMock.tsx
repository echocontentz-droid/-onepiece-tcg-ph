import { Img, staticFile } from "remotion";
import { theme } from "../theme";

type Props = {
  src: string;
  height?: number;
  rotate?: number;
};

export const PhoneMock: React.FC<Props> = ({ src, height = 880, rotate = 0 }) => {
  const aspect = 1080 / 1740;
  const width = height * aspect;
  const radius = Math.min(40, height * 0.045);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: theme.ink1,
        boxShadow: `0 40px 90px rgba(0, 0, 0, 0.55), 0 0 0 1px ${theme.hairline2}`,
        transform: `rotate(${rotate}deg)`,
        position: "relative",
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          boxShadow: `inset 0 0 80px rgba(0, 0, 0, 0.4)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
