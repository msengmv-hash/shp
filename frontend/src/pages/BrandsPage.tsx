import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/shared/api/client";
import type { Brand } from "@/shared/api/types";

export function BrandsPage() {
  const { data } = useQuery({ queryKey: ["brands"], queryFn: async () => (await api.get<Brand[]>("/brands/")).data });
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Бренды</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {data?.map((brand) => (
          <Link key={brand.id} to={`/catalog?brand=${brand.slug}`} className="rounded-md border border-brand-line p-5 hover:border-brand-red">
            <div className="text-lg font-bold">{brand.title}</div>
            <p className="mt-2 min-h-10 text-sm text-zinc-500">{brand.description || "Коллекции мебели для дома"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
