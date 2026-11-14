import { createFileRoute } from "@tanstack/react-router";
import { Community } from "@/components/vanta/Community";

export const Route = createFileRoute("/community")({
  component: Community,
});
