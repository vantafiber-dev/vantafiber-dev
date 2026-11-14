import { createFileRoute } from "@tanstack/react-router";
import { Members } from "@/components/vanta/Members";

export const Route = createFileRoute("/members")({
  component: Members,
});
