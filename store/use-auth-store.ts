import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AdminUser } from "@/types/auth";

/**
 * Who is signed in, for display only. The tokens live in httpOnly cookies
 * (see libs/auth/session.ts) and are never stored here. proxy.ts and the
 * /api/backend proxy decide whether the session is valid, not this store.
 *
 * `skipHydration` keeps the server render and the first client render the
 * same. AppProviders rehydrates the store after mount.
 */
interface AuthState {
  user: AdminUser | null;
  setUser: (user: AdminUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: "xp-admin-auth",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
