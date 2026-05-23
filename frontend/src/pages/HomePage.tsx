import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ProductCard } from "@/entities/product/ProductCard";
import { useProducts } from "@/entities/product/api";
import { useStorefrontSummary } from "@/entities/storefront/api";
import { api } from "@/shared/api/client";
import type { Category } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function HomePage() {
  const { data: categories, isError: categoriesError } = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.get<Category[]>("/categories/")).data });
  const { data, isLoading, isError: productsError } = useProducts({ is_hit: true, ordering: "-rating" });
  const { data: summary, isError: summaryError } = useStorefrontSummary();

  return (
    <div>
      <section className="bg-[#f7f2ea]">
        <div className="container-page grid min-h-[420px] items-center gap-8 py-8 md:grid-cols-[1fr_520px]">
          <div>
            <p className="text-sm font-bold uppercase text-brand-red">Сезонное обновление дома</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight md:text-6xl">Мебель, которую легко выбрать онлайн</h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600">Каталог по комнатам, честные характеристики, скидки, отзывы и быстрый checkout.</p>
            <div className="mt-7 flex gap-3">
              <Link to="/catalog"><Button>Перейти в каталог</Button></Link>
              <Link to="/promotions"><Button variant="outline">Смотреть акции</Button></Link>
            </div>
          </div>
          <img className="h-[360px] w-full rounded-md object-cover" src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80" alt="Современная гостиная" />
        </div>
      </section>
      <section className="container-page py-10">
        <div className="mb-8 grid gap-3 md:grid-cols-4">
          {summaryError && <div className="col-span-full rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Не удалось загрузить витрину. Проверьте backend на http://127.0.0.1:8000/api/</div>}
          {[
            ["Товаров", summary?.products],
            ["Категорий", summary?.categories],
            ["Брендов", summary?.brands],
            ["Акций", summary?.promotions],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-md border border-brand-line p-4">
              <div className="text-2xl font-black">{value ?? "..."}</div>
              <div className="text-sm text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">Каталог по комнатам</h2>
            <p className="text-sm text-zinc-500">Выбирайте мебель по помещению или типу товара.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesError && <div className="col-span-full rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Категории не загрузились. Чаще всего это CORS или выключенный backend.</div>}
          {categories?.map((category) => (
            <Link key={category.id} to={`/catalog?category=${category.slug}`} className="group overflow-hidden rounded-md border border-brand-line bg-white transition hover:border-brand-red">
              <div className="aspect-[16/9] bg-brand-muted">
                <img src={category.image_url || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80"} alt={category.title} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="p-4 font-semibold group-hover:text-brand-red">{category.title}</div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container-page py-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">Популярные товары</h2>
            <p className="text-sm text-zinc-500">Карточки с ценой, скидкой, рейтингом и быстрым добавлением.</p>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-brand-red">Все товары</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productsError && <div className="col-span-full rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Товары не загрузились. Откройте API и проверьте, что сервер отвечает.</div>}
          {isLoading && Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80" />)}
          {data?.results.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      <section className="container-page py-8">
        <h2 className="text-2xl font-black">Популярные разделы</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {summary?.top_categories.map((item) => (
            <Link key={item.slug} to={`/catalog?category=${item.slug}`} className="rounded-full border border-brand-line px-4 py-2 text-sm hover:border-brand-red hover:text-brand-red">
              {item.title} · {item.products_count}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
