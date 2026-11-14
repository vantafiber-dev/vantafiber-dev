import { createFileRoute } from "@tanstack/react-router";
import { Commerce } from "@/components/vanta/Commerce";

export const Route = createFileRoute("/commerce")({
  component: Commerce,
});
