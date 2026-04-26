import { Composition } from "remotion";
import { CardhausPromo } from "./Composition";
import { durationInFrames, fps, height, width } from "./theme";

export const Root: React.FC = () => {
  return (
    <Composition
      id="CardhausPromo"
      component={CardhausPromo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={width}
      height={height}
    />
  );
};
