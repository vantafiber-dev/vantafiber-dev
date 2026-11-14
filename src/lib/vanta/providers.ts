export type ProviderStatus = "ready" | "owner_gated" | "disabled";

export type ProviderCapability = {
  id: string;
  label: string;
  status: ProviderStatus;
};

export type GameServerProvider = {
  id: string;
  name: string;
  status: ProviderStatus;
  capabilities: ProviderCapability[];
  deploy: (configIni: string) => Promise<{ ok: boolean; message: string }>;
  statusCheck: () => Promise<{ ok: boolean; message: string }>;
};

export const nitradoProvider: GameServerProvider = {
  id: "nitrado",
  name: "Nitrado (Xbox ASE)",
  status: "owner_gated",
  capabilities: [
    { id: "deploy", label: "Deploy server", status: "owner_gated" },
    { id: "restart", label: "Restart", status: "owner_gated" },
    { id: "wipe", label: "Wipe", status: "owner_gated" },
    { id: "backup", label: "Backup", status: "owner_gated" },
  ],
  deploy: async () => ({ ok: false, message: "Owner-gated: Nitrado credentials not configured." }),
  statusCheck: async () => ({ ok: false, message: "Owner-gated: Nitrado credentials not configured." }),
};

export const providers: GameServerProvider[] = [nitradoProvider];
