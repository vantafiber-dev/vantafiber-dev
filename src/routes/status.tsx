import { createFileRoute } from "@tanstack/react-router";
import { Status } from "@/components/vanta/Status";

export const Route = createFileRoute("/status")({
  component: Status,
});
