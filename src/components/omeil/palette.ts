import type { Strategy } from "@/lib/omeil/types.ts";

/** Mirrors the CSS tokens for canvas and WebGL, which cannot read utilities. */
export const STRATEGY_COLOR: Record<Strategy, string> = {
  cooperator: "#3ee0c7",
  conditional: "#e7eef6",
  forager: "#8ea0b5",
  defector: "#e3a008",
};

export const STRATEGY_LABEL: Record<Strategy, string> = {
  cooperator: "Cooperator",
  conditional: "Conditional",
  forager: "Forager",
  defector: "Defector",
};

export const FIELD = "#071014";
export const INK = "#07090c";
export const CYAN = "#3ee0c7";
