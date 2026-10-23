import { create } from "zustand";

/**
 * The email and code of a password reset in progress, carried from one recovery
 * screen to the next. Memory only, on purpose: the code never reaches the URL or
 * storage, and a reload sends the admin back to the start.
 */
interface PasswordResetState {
  email: string | null;
  otpCode: string | null;
  setEmail: (email: string) => void;
  setOtpCode: (otpCode: string) => void;
  clear: () => void;
}

export const usePasswordResetStore = create<PasswordResetState>()((set) => ({
  email: null,
  otpCode: null,
  setEmail: (email) => set({ email, otpCode: null }),
  setOtpCode: (otpCode) => set({ otpCode }),
  clear: () => set({ email: null, otpCode: null }),
}));
