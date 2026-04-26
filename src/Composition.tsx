import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { sceneFrames, theme } from "./theme";
import { Backdrop } from "./components/Backdrop";
import { Welcome } from "./scenes/Welcome";
import { Auction } from "./scenes/Auction";
import { Marketplace } from "./scenes/Marketplace";
import { SellerDash } from "./scenes/SellerDash";
import { Handoff } from "./scenes/Handoff";
import { CallToAction } from "./scenes/CallToAction";

loadDisplay();
loadSans();
loadMono();

export const CardhausPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <Audio src={staticFile("audio/soundtrack.mp3")} volume={0.6} />
      <Backdrop />

      <Sequence from={sceneFrames.welcome.from} durationInFrames={sceneFrames.welcome.length}>
        <Welcome />
      </Sequence>

      <Sequence from={sceneFrames.auction.from} durationInFrames={sceneFrames.auction.length}>
        <Auction />
      </Sequence>

      <Sequence from={sceneFrames.marketplace.from} durationInFrames={sceneFrames.marketplace.length}>
        <Marketplace />
      </Sequence>

      <Sequence from={sceneFrames.sellerDash.from} durationInFrames={sceneFrames.sellerDash.length}>
        <SellerDash />
      </Sequence>

      <Sequence from={sceneFrames.handoff.from} durationInFrames={sceneFrames.handoff.length}>
        <Handoff />
      </Sequence>

      <Sequence from={sceneFrames.cta.from} durationInFrames={sceneFrames.cta.length}>
        <CallToAction />
      </Sequence>
    </AbsoluteFill>
  );
};
