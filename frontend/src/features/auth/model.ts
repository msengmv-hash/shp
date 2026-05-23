import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  access: string | null;
  refresh: string | null;
  setTokens: (tokens: { access: string; refresh: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      setTokens: (tokens) => set(tokens),
      logout: () => set({ access: null, refresh: null }),
    }),
    { name: "fm-auth" },
  ),
);
