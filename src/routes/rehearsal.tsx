import { createFileRoute } from "@tanstack/react-router";
import { Rehearsal } from "@/components/vanta/Rehearsal";

export const Route = createFileRoute("/rehearsal")({
  component: Rehearsal,
});
