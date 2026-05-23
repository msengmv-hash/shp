import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { Favorite, Paginated } from "@/shared/api/types";

export function useFavorites() {
  return useQuery({ queryKey: ["favorites"], queryFn: async () => (await api.get<Paginated<Favorite>>("/favorites/")).data, retry: false });
}

export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (product: number) => (await api.post("/favorites/toggle/", { product })).data,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["favorites"] });
      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
