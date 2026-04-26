import { Composition } from "remotion";
import { CardhausPromo } from "./Composition";
import { durationInFrames, fps } from "./theme";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CardhausPromo"
        component={CardhausPromo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="CardhausPromoVertical"
        component={CardhausPromo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1080}
        height={1920}
      />
    </>
  );
};
