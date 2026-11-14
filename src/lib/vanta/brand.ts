export const VANTA = {
  name: "Vanta Fiber",
  product: "Xbox ASE Fibercraft PvP",
  seasonName: "Season Zero",
  tagline: "Build fast. Fight fair.",
  shortTagline: "The fast fibercraft PvP community for Xbox and Windows",
  description:
    "Vanta Fiber is a free-first Xbox and Microsoft Store ARK: Survival Evolved fibercraft PvP community. Build fast. Fight fair.",
  founder: "PlayNexus",
  colors: {
    basalt: "#0B0D11",
    slate: "#151922",
    ash: "#F1F3F5",
    muted: "#AAB3C2",
    ember: "#FF7548",
    signalBlue: "#79C1FF",
  },
  platform: {
    xbox: {
      id: "xbox",
      label: "Xbox console",
      store: "Microsoft Store / Xbox app",
      note: "Requires an Xbox Series X|S or Xbox One plus a Game Pass or Microsoft Store purchase.",
    },
    windowsStore: {
      id: "windows-store",
      label: "Windows (Microsoft Store / Game Pass)",
      store: "Microsoft Store / Xbox app",
      note: "Requires a Microsoft Store or Game Pass purchase of ARK: Survival Evolved.",
    },
  },
  regions: [
    { id: "au", label: "Australia (AU)", tz: "Australia/Sydney", currency: "AUD" },
    { id: "na", label: "North America (NA)", tz: "America/Los_Angeles", currency: "USD" },
    { id: "eu", label: "Europe (EU)", tz: "Europe/Berlin", currency: "EUR" },
  ],
  modes: [
    { id: "prototype", label: "Prototype" },
    { id: "season-one", label: "Season One" },
    { id: "tournament", label: "Tournament" },
  ],
} as const;

export type VantaPlatformId = "xbox" | "windows-store";
export type VantaModeId = "prototype" | "season-one" | "tournament";
export type VantaRegionId = "au" | "na" | "eu";
