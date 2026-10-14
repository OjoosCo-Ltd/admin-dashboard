import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { loginAction, logoutAction } from "@/actions/auth-actions";
import { useAuthStore } from "@/store/use-auth-store";

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: loginAction,
    onSuccess: setUser,
    // The login form shows its own error.
    meta: { silent: true },
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logoutAction,
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace("/login");
    },
  });
}
