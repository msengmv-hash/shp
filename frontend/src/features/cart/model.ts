import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { Cart } from "@/shared/api/types";

export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: async () => (await api.get<Cart>("/cart/")).data });
}

export function useAddToCart() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { product: number; quantity: number }) => (await api.post<Cart>("/cart/add/", payload)).data,
    onSuccess: (data) => client.setQueryData(["cart"], data),
  });
}

export function useUpdateCartItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { item: number; quantity: number }) => (await api.post<Cart>("/cart/update_item/", payload)).data,
    onSuccess: (data) => client.setQueryData(["cart"], data),
  });
}

export function useRemoveCartItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { item: number }) => (await api.post<Cart>("/cart/remove/", payload)).data,
    onSuccess: (data) => client.setQueryData(["cart"], data),
  });
}
