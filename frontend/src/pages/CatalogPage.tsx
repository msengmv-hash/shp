import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "@/entities/product/ProductCard";
import { useProducts } from "@/entities/product/api";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(params.entries());
  const { data, isLoading } = useProducts(query);

  function update(name: string, value: string) {
    const next = new URLSearchParams(params);
    value ? next.set(name, value) : next.delete(name);
    setParams(next);
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 text-sm text-zinc-500">Главная / Каталог</div>
      <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
        <aside className="h-max rounded-md border border-brand-line bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal size={18} /> Фильтры</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">Цена от<Input value={params.get("min_price") ?? ""} onChange={(e) => update("min_price", e.target.value)} /></label>
            <label className="grid gap-2 text-sm">Цена до<Input value={params.get("max_price") ?? ""} onChange={(e) => update("max_price", e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={params.get("in_stock") === "true"} onChange={(e) => update("in_stock", e.target.checked ? "true" : "")} /> В наличии</label>
          </div>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black">Каталог мебели</h1>
              <p className="text-sm text-zinc-500">Найдено {data?.count ?? 0} товаров</p>
            </div>
            <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 w-11 px-0" aria-label="Сетка"><LayoutGrid size={18} /></Button>
            <Button variant="ghost" className="h-11 w-11 px-0" aria-label="Список"><List size={18} /></Button>
            <select className="h-11 rounded-md border border-brand-line px-3" value={params.get("ordering") ?? ""} onChange={(e) => update("ordering", e.target.value)}>
              <option value="">По популярности</option>
              <option value="price">Сначала дешевле</option>
              <option value="-price">Сначала дороже</option>
              <option value="-rating">По рейтингу</option>
            </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading && Array.from({ length: 9 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
            {data?.results.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {data && data.count > data.results.length && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button className="rounded-md border border-brand-line px-4 py-2 disabled:opacity-40" disabled={!data.previous} onClick={() => update("page", String(Math.max(Number(params.get("page") ?? 1) - 1, 1)))}>Назад</button>
              <span className="text-sm text-zinc-500">Страница {params.get("page") ?? 1}</span>
              <button className="rounded-md border border-brand-line px-4 py-2 disabled:opacity-40" disabled={!data.next} onClick={() => update("page", String(Number(params.get("page") ?? 1) + 1))}>Вперед</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
