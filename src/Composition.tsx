import { AbsoluteFill, Sequence } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { sceneFrames, theme } from "./theme";
import { Intro } from "./scenes/Intro";
import { Tagline } from "./scenes/Tagline";
import { Features } from "./scenes/Features";
import { CallToAction } from "./scenes/CallToAction";
import { Outro } from "./scenes/Outro";
import { Backdrop } from "./components/Backdrop";

loadDisplay();
loadSans();

export const CardhausPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.paper, overflow: "hidden" }}>
      <Backdrop />

      <Sequence from={sceneFrames.intro.from} durationInFrames={sceneFrames.intro.length}>
        <Intro />
      </Sequence>

      <Sequence from={sceneFrames.tagline.from} durationInFrames={sceneFrames.tagline.length}>
        <Tagline />
      </Sequence>

      <Sequence from={sceneFrames.features.from} durationInFrames={sceneFrames.features.length}>
        <Features />
      </Sequence>

      <Sequence from={sceneFrames.cta.from} durationInFrames={sceneFrames.cta.length}>
        <CallToAction />
      </Sequence>

      <Sequence from={sceneFrames.outro.from} durationInFrames={sceneFrames.outro.length}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
