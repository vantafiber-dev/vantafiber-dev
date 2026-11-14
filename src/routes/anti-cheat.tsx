import { createFileRoute } from "@tanstack/react-router";
import { AntiCheat } from "@/components/vanta/AntiCheat";

export const Route = createFileRoute("/anti-cheat")({
  component: AntiCheat,
});
