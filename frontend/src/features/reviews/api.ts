import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { Paginated, Review } from "@/shared/api/types";

export function useReviews(product?: number) {
  return useQuery({
    queryKey: ["reviews", product],
    enabled: Boolean(product),
    queryFn: async () => (await api.get<Paginated<Review>>("/reviews/", { params: { product } })).data,
  });
}

export function useCreateReview(product?: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rating: number; text: string }) => (await api.post<Review>("/reviews/", { ...payload, product })).data,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["reviews", product] });
      client.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
