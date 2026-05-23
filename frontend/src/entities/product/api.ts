import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { Paginated, Product } from "@/shared/api/types";

export function useProducts(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => (await api.get<Paginated<Product>>("/products/", { params })).data,
  });
}

export function useProduct(slug?: string) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: Boolean(slug),
    queryFn: async () => (await api.get<Product>(`/products/${slug}/`)).data,
  });
}
