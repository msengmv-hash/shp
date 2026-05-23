import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/shared/api/client";
import type { Paginated, Promotion } from "@/shared/api/types";

export function PromotionsPage() {
  const { data } = useQuery({ queryKey: ["promotions"], queryFn: async () => (await api.get<Paginated<Promotion>>("/promotions/")).data });
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Акции</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data?.results?.map((promo) => (
          <article key={promo.id} className="overflow-hidden rounded-md border border-brand-line bg-white">
            {promo.image_url && <img src={promo.image_url} alt={promo.title} className="aspect-[16/9] w-full object-cover" />}
            <div className="p-6">
            <h2 className="text-xl font-black">{promo.title}</h2>
            <p className="mt-2 text-zinc-600">{promo.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {promo.products.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.slug}`} className="rounded-full bg-brand-muted px-3 py-1 text-xs hover:text-brand-red">{product.title}</Link>
              ))}
            </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
