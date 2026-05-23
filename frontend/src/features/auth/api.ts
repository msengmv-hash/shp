import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/model";
import { api } from "@/shared/api/client";
import type { User } from "@/shared/api/types";

export function useProfile() {
  const access = useAuthStore((state) => state.access);
  return useQuery({
    queryKey: ["profile"],
    enabled: Boolean(access),
    retry: false,
    queryFn: async () => (await api.get<User>("/auth/profile/")).data,
  });
}

export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { username: string; password: string }) => (await api.post<{ access: string; refresh: string }>("/auth/token/", payload)).data,
    onSuccess: (tokens) => {
      setTokens(tokens);
      client.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: { username: string; email: string; phone?: string; password: string }) => (await api.post<User>("/auth/register/", payload)).data,
  });
}
