import { createFileRoute } from "@tanstack/react-router";
import { FairPlay } from "@/components/vanta/FairPlay";

export const Route = createFileRoute("/fair-play")({
  component: FairPlay,
});
