import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { sceneFrames, theme } from "./theme";
import { Backdrop } from "./components/Backdrop";
import { Welcome } from "./scenes/Welcome";
import { Auction } from "./scenes/Auction";
import { Marketplace } from "./scenes/Marketplace";
import { SellerDash } from "./scenes/SellerDash";
import { Handoff } from "./scenes/Handoff";
import { CallToAction } from "./scenes/CallToAction";

const sfx = {
  whoosh: "audio/sfx/whoosh.mp3",
  ding: "audio/sfx/ding.mp3",
  tick: "audio/sfx/tick.mp3",
  click: "audio/sfx/click.mp3",
} as const;

const Cue: React.FC<{ from: number; src: keyof typeof sfx; volume?: number }> = ({ from, src, volume = 0.5 }) => (
  <Sequence from={from}>
    <Audio src={staticFile(sfx[src])} volume={volume} />
  </Sequence>
);

export const CardhausPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <link rel="stylesheet" href={staticFile("fonts/fonts.css")} />

      <Audio src={staticFile("audio/soundtrack.mp3")} volume={0.55} />

      <Cue from={sceneFrames.auction.from - 8} src="whoosh" volume={0.45} />
      <Cue from={sceneFrames.marketplace.from - 8} src="whoosh" volume={0.45} />
      <Cue from={sceneFrames.sellerDash.from - 8} src="whoosh" volume={0.45} />
      <Cue from={sceneFrames.handoff.from - 8} src="whoosh" volume={0.45} />
      <Cue from={sceneFrames.cta.from - 8} src="whoosh" volume={0.5} />

      <Cue from={sceneFrames.auction.from + 60} src="tick" volume={0.55} />
      <Cue from={sceneFrames.auction.from + 70} src="tick" volume={0.55} />
      <Cue from={sceneFrames.auction.from + 80} src="tick" volume={0.55} />
      <Cue from={sceneFrames.auction.from + 90} src="ding" volume={0.5} />

      <Cue from={sceneFrames.handoff.from + 50} src="ding" volume={0.32} />
      <Cue from={sceneFrames.handoff.from + 56} src="ding" volume={0.32} />
      <Cue from={sceneFrames.handoff.from + 62} src="ding" volume={0.32} />
      <Cue from={sceneFrames.handoff.from + 68} src="ding" volume={0.32} />

      <Cue from={sceneFrames.cta.from + 42} src="click" volume={0.55} />

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
