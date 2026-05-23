import { Heart, Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductCard } from "@/entities/product/ProductCard";
import { useProducts } from "@/entities/product/api";
import { useAuthStore } from "@/features/auth/model";
import { useFavorites } from "@/features/favorites/api";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function FavoritesPage() {
  const access = useAuthStore((state) => state.access);
  const { data, isLoading } = useFavorites();
  const recommendations = useProducts({ is_hit: true, ordering: "-rating" });
  const items = data?.results ?? [];

  if (!access) {
    return (
      <div className="container-page py-8">
        <div className="grid min-h-[360px] place-items-center rounded-md border border-brand-line bg-white p-8 text-center">
          <div>
            <Heart className="mx-auto text-brand-red" size={44} />
            <h1 className="mt-4 text-3xl font-black">Избранное</h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">Войдите в аккаунт, чтобы сохранять товары и возвращаться к ним позже.</p>
            <Link to="/login"><Button className="mt-6">Войти</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Личный кабинет / Избранное</p>
          <h1 className="mt-2 text-3xl font-black">Избранное</h1>
          <p className="mt-1 text-sm text-zinc-500">{items.length ? `${items.length} сохраненных товаров` : "Сохраняйте товары, чтобы сравнить и купить позже"}</p>
        </div>
        <Link to="/catalog"><Button variant="outline"><Search size={18} /> В каталог</Button></Link>
      </div>

      {isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80" />)}</div>}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((favorite) => <ProductCard key={favorite.id} product={favorite.product_detail} />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <section className="grid gap-6 rounded-md border border-dashed border-brand-line bg-white p-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-brand-red"><Heart size={28} /></div>
            <h2 className="mt-5 text-2xl font-black">Пока ничего не сохранено</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Нажимайте на сердечко в карточках товаров. Здесь появится список мебели, которую удобно сравнить перед покупкой.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/catalog"><Button>Перейти в каталог</Button></Link>
              <Link to="/cart"><Button variant="outline"><ShoppingCart size={18} /> Корзина</Button></Link>
            </div>
          </div>
          <div className="rounded-md bg-brand-muted p-5">
            <h3 className="font-bold">Как пользоваться избранным</h3>
            <div className="mt-4 grid gap-3 text-sm text-zinc-600">
              <p>1. Откройте каталог или поиск.</p>
              <p>2. Нажмите на сердечко у подходящего товара.</p>
              <p>3. Вернитесь сюда, чтобы быстро добавить товар в корзину.</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-black">Популярное сейчас</h2>
          <Link to="/catalog" className="text-sm font-semibold text-brand-red">Все товары</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.data?.results.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}
