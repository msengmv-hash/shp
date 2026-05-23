import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { StorefrontSummary } from "@/shared/api/types";

export function useStorefrontSummary() {
  return useQuery({
    queryKey: ["storefront"],
    queryFn: async () => (await api.get<StorefrontSummary>("/storefront/")).data,
  });
}
