import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "@/features/auth/model";
import { useAddToCart } from "@/features/cart/model";
import { useToggleFavorite } from "@/features/favorites/api";
import type { Product } from "@/shared/api/types";
import { useToastStore } from "@/shared/ui/toast";

const fallback = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80";

export function ProductCard({ product }: { product: Product }) {
  const add = useAddToCart();
  const favorite = useToggleFavorite();
  const access = useAuthStore((state) => state.access);
  const push = useToastStore((state) => state.push);
  const inStock = product.stock > 0;

  function toggleFavorite() {
    if (!access) {
      push("Войдите, чтобы добавлять товары в избранное", "error");
      return;
    }
    favorite.mutate(product.id, {
      onSuccess: () => push(product.is_favorite ? "Убрано из избранного" : "Добавлено в избранное", "success"),
    });
  }

  return (
    <article className="group relative flex h-full flex-col rounded-md border border-brand-line bg-white p-3 transition hover:border-zinc-300 hover:shadow-soft">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded bg-brand-muted">
          <img src={product.image || fallback} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.discount_percent > 0 && <span className="rounded bg-brand-red px-2 py-1 text-xs font-bold text-white">-{product.discount_percent}%</span>}
            {product.is_hit && <span className="rounded bg-zinc-900 px-2 py-1 text-xs font-bold text-white">Хит</span>}
            {product.is_new && <span className="rounded bg-white px-2 py-1 text-xs font-bold text-zinc-900">Новинка</span>}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="text-zinc-600">{product.rating || "0.0"} · {product.reviews_count} отзывов</span>
        </div>
        <h3 className="mt-2 min-h-11 text-sm font-medium leading-5 text-zinc-900">{product.title}</h3>
        <p className="mt-1 text-xs text-zinc-500">{product.brand.title} · {product.category.title}</p>
      </Link>

      <div className="mt-auto pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{Number(product.price).toLocaleString("ru-RU")} ₽</span>
          {product.old_price && <span className="text-sm text-zinc-400 line-through">{Number(product.old_price).toLocaleString("ru-RU")} ₽</span>}
        </div>
        <p className={inStock ? "mt-1 text-xs text-emerald-600" : "mt-1 text-xs text-zinc-500"}>{inStock ? `В наличии: ${product.stock} шт.` : "Под заказ"}</p>
        <div className="mt-3 grid grid-cols-[1fr_44px] gap-2">
          <button
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-red px-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            disabled={!inStock}
            onClick={() => add.mutate({ product: product.id, quantity: 1 }, { onSuccess: () => push("Товар добавлен в корзину", "success") })}
          >
            <ShoppingCart size={17} /> В корзину
          </button>
          <button className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-brand-line bg-white transition hover:border-brand-red" aria-label="Добавить в избранное" onClick={toggleFavorite}>
            <Heart size={18} fill={product.is_favorite ? "currentColor" : "none"} className={product.is_favorite ? "text-brand-red" : ""} />
          </button>
        </div>
      </div>
    </article>
  );
}
