export const WAITLIST_PLATFORMS = ["xbox", "windows-store"] as const;

export type WaitlistPlatform = (typeof WAITLIST_PLATFORMS)[number];

export type WaitlistConsent = {
  agreedToRules: boolean;
  optedInUpdates: boolean;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  platform: WaitlistPlatform;
  region: string;
  consent: WaitlistConsent;
  createdAt: string;
};

export type WaitlistInput = {
  email: string;
  platform: WaitlistPlatform;
  region: string;
  consent: WaitlistConsent;
};

export type WaitlistResult =
  | { ok: true; entry: WaitlistEntry }
  | { ok: false; error: string };

export type WaitlistStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export const WAITLIST_STORAGE_KEY = "vanta-fiber:waitlist:v1";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
}

export function isValidPlatform(value: unknown): value is WaitlistPlatform {
  return (
    typeof value === "string" && (WAITLIST_PLATFORMS as readonly string[]).includes(value)
  );
}

export function createWaitlistStore(
  storage: WaitlistStorage,
): {
  read: () => WaitlistEntry[];
  add: (input: WaitlistInput) => WaitlistResult;
  clear: () => void;
} {
  function read(): WaitlistEntry[] {
    try {
      const raw = storage.getItem(WAITLIST_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (e): e is WaitlistEntry =>
          !!e && typeof e === "object" && typeof (e as WaitlistEntry).id === "string",
      );
    } catch {
      return [];
    }
  }

  function add(input: WaitlistInput): WaitlistResult {
    const email = input.email.trim().toLowerCase();
    const region = input.region.trim();
    if (!isValidEmail(email)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (!isValidPlatform(input.platform)) {
      return { ok: false, error: "Choose a supported platform." };
    }
    if (region.length < 2) {
      return { ok: false, error: "Choose or enter a region." };
    }
    if (!input.consent.agreedToRules) {
      return { ok: false, error: "You must agree to the community rules to join the waitlist." };
    }
    const entries = read();
    if (entries.some((e) => e.email === email)) {
      return { ok: false, error: "This email is already on the waitlist." };
    }
    const entry: WaitlistEntry = {
      id: `vf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      email,
      platform: input.platform,
      region,
      consent: { ...input.consent },
      createdAt: new Date().toISOString(),
    };
    storage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([...entries, entry]));
    return { ok: true, entry };
  }

  function clear(): void {
    storage.removeItem(WAITLIST_STORAGE_KEY);
  }

  return { read, add, clear };
}

export function defaultWaitlistStorage(): WaitlistStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const store: WaitlistStorage = {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => window.localStorage.setItem(k, v),
      removeItem: (k) => window.localStorage.removeItem(k),
    };
    const probe = "__vanta_probe__";
    store.getItem(probe);
    return store;
  } catch {
    return null;
  }
}
