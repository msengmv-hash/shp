import { ChevronRight, CreditCard, Heart, PackageCheck, RotateCcw, Ruler, ShieldCheck, Star, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";

import { ProductCard } from "@/entities/product/ProductCard";
import { useProduct, useProducts } from "@/entities/product/api";
import { useAuthStore } from "@/features/auth/model";
import { useAddToCart } from "@/features/cart/model";
import { useToggleFavorite } from "@/features/favorites/api";
import { useCreateReview, useReviews } from "@/features/reviews/api";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { useToastStore } from "@/shared/ui/toast";

const fallback = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const [activeImage, setActiveImage] = useState<string>("");
  const add = useAddToCart();
  const favorite = useToggleFavorite();
  const access = useAuthStore((state) => state.access);
  const push = useToastStore((state) => state.push);
  const reviews = useReviews(product?.id);
  const createReview = useCreateReview(product?.id);
  const related = useProducts({ category: product?.category.slug, page_size: 8 });
  const { register, handleSubmit, reset } = useForm<{ rating: number; text: string }>({ defaultValues: { rating: 5 } });

  const gallery = useMemo(() => {
    if (!product) return [];
    const images = [product.image, ...(product.images ?? []).map((item) => item.image)].filter(Boolean);
    return Array.from(new Set(images.length ? images : [fallback]));
  }, [product]);

  if (isLoading) {
    return <div className="container-page py-8"><Skeleton className="h-[720px]" /></div>;
  }

  if (!product) {
    return <div className="container-page py-12 text-zinc-500">Товар не найден.</div>;
  }

  const currentProduct = product;
  const image = activeImage || gallery[0] || fallback;
  const inStock = currentProduct.stock > 0;
  const attributes = currentProduct.attributes ?? [];
  const dimensionText = attributes
    .filter((item) => ["Ширина", "Глубина", "Высота"].includes(item.name))
    .map((item) => `${item.name}: ${item.value}`)
    .join(" · ");

  function addToCart() {
    add.mutate({ product: currentProduct.id, quantity: 1 }, { onSuccess: () => push("Товар добавлен в корзину", "success") });
  }

  function toggleFavorite() {
    if (!access) {
      push("Войдите, чтобы добавить товар в избранное", "error");
      return;
    }
    favorite.mutate(currentProduct.id, { onSuccess: () => push("Избранное обновлено", "success") });
  }

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
        <Link to="/" className="hover:text-brand-red">Главная</Link>
        <ChevronRight size={15} />
        <Link to="/catalog" className="hover:text-brand-red">Каталог</Link>
        <ChevronRight size={15} />
        <Link to={`/catalog?category=${product.category.slug}`} className="hover:text-brand-red">{product.category.title}</Link>
        <ChevronRight size={15} />
        <span className="text-zinc-800">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="grid gap-4 md:grid-cols-[92px_minmax(0,1fr)]">
          <div className="hidden content-start gap-3 md:grid">
            {gallery.slice(0, 6).map((src) => (
              <button key={src} className={`aspect-square overflow-hidden rounded-md border bg-brand-muted ${src === image ? "border-brand-red" : "border-brand-line"}`} onClick={() => setActiveImage(src)}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-md border border-brand-line bg-brand-muted">
            <img src={image} alt={product.title} className="aspect-[4/3] w-full object-cover" />
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:h-max">
          <div className="flex flex-wrap gap-2">
            {product.discount_percent > 0 && <span className="rounded bg-brand-red px-2 py-1 text-xs font-bold text-white">Скидка {product.discount_percent}%</span>}
            {product.is_hit && <span className="rounded bg-zinc-900 px-2 py-1 text-xs font-bold text-white">Хит продаж</span>}
            {product.is_new && <span className="rounded bg-brand-muted px-2 py-1 text-xs font-bold text-zinc-900">Новинка</span>}
          </div>

          <h1 className="mt-4 text-2xl font-black leading-tight md:text-3xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="flex items-center gap-1 text-amber-500"><Star size={17} fill="currentColor" /> {product.rating}</span>
            <span>{product.reviews_count} отзывов</span>
            <span>Артикул: {product.sku}</span>
            <span>{product.brand.title}</span>
          </div>

          <div className="mt-6 rounded-md border border-brand-line bg-white p-5 shadow-soft">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black md:text-4xl">{Number(product.price).toLocaleString("ru-RU")} ₽</span>
              {product.old_price && <span className="text-lg text-zinc-400 line-through">{Number(product.old_price).toLocaleString("ru-RU")} ₽</span>}
            </div>
            <p className={inStock ? "mt-2 text-sm font-medium text-emerald-600" : "mt-2 text-sm font-medium text-zinc-500"}>
              {inStock ? `В наличии: ${product.stock} шт. Доставка от 1 дня` : "Под заказ, уточните срок у менеджера"}
            </p>

            <div className="mt-5 grid grid-cols-[1fr_52px] gap-3">
              <Button className="h-12 text-base" disabled={!inStock} onClick={addToCart}>Добавить в корзину</Button>
              <Button variant="outline" className="h-12 px-0" aria-label="Избранное" onClick={toggleFavorite}>
                <Heart size={21} fill={product.is_favorite ? "currentColor" : "none"} className={product.is_favorite ? "text-brand-red" : ""} />
              </Button>
            </div>

            <div className="mt-5 grid gap-3 border-t border-brand-line pt-5 text-sm">
              <Info icon={<Truck size={18} />} title="Доставка" text="Курьером, транспортной компанией или самовывозом." />
              <Info icon={<PackageCheck size={18} />} title="Сборка" text="Можно добавить сборку при подтверждении заказа." />
              <Info icon={<CreditCard size={18} />} title="Оплата" text="Онлайн, картой при получении или mock-платеж локально." />
              <Info icon={<ShieldCheck size={18} />} title="Гарантия" text="Официальная гарантия производителя." />
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-md border border-brand-line p-6">
          <h2 className="text-2xl font-black">Описание</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-zinc-600">{product.description}</p>
          {dimensionText && <p className="mt-4 flex items-center gap-2 text-sm text-zinc-700"><Ruler size={18} /> {dimensionText}</p>}
        </div>
        <div className="rounded-md border border-brand-line p-6">
          <h2 className="text-2xl font-black">Покупателю</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-600">
            <p className="flex gap-2"><RotateCcw size={18} className="shrink-0 text-zinc-900" /> Возврат в соответствии с правилами магазина.</p>
            <p className="flex gap-2"><ShieldCheck size={18} className="shrink-0 text-zinc-900" /> Проверяйте комплектность при получении.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-md border border-brand-line p-6">
        <h2 className="text-2xl font-black">Характеристики</h2>
        <div className="mt-4 grid gap-x-8 md:grid-cols-2">
          {attributes.map((item) => (
            <div key={item.id} className="grid gap-1 border-b border-dashed border-zinc-200 py-3 text-sm sm:grid-cols-[160px_1fr]">
              <span className="text-zinc-500">{item.name}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-2xl font-black">Отзывы</h2>
          <div className="mt-4 grid gap-3">
            {reviews.data?.results.map((review) => (
              <article key={review.id} className="rounded-md border border-brand-line p-4">
                <div className="flex items-center justify-between">
                  <strong>{review.user_name}</strong>
                  <span className="text-sm text-amber-500">{"★".repeat(review.rating)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{review.text}</p>
              </article>
            ))}
            {reviews.data?.results.length === 0 && <p className="text-sm text-zinc-500">Отзывов пока нет.</p>}
          </div>
        </div>

        <form
          className="h-max rounded-md border border-brand-line p-5"
          onSubmit={handleSubmit((data) => {
            if (!access) {
              push("Войдите, чтобы оставить отзыв", "error");
              return;
            }
            createReview.mutate({ rating: Number(data.rating), text: data.text }, {
              onSuccess: () => {
                reset({ rating: 5, text: "" });
                push("Отзыв опубликован", "success");
              },
              onError: () => push("Не удалось опубликовать отзыв", "error"),
            });
          })}
        >
          <h3 className="font-bold">Оставить отзыв</h3>
          <select className="mt-4 h-11 w-full rounded-md border border-brand-line px-3" {...register("rating", { required: true })}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} звезд</option>)}
          </select>
          <textarea className="mt-3 min-h-28 w-full rounded-md border border-brand-line p-3 text-sm" placeholder="Что понравилось или не подошло?" {...register("text", { required: true })} />
          <Button className="mt-3 w-full" disabled={createReview.isPending}>Опубликовать</Button>
        </form>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-black">Похожие товары</h2>
          <Link to={`/catalog?category=${product.category.slug}`} className="text-sm font-semibold text-brand-red">В раздел</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.data?.results.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}

function Info({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-zinc-900">{icon}</span>
      <span>
        <strong className="block text-zinc-900">{title}</strong>
        <span className="text-zinc-500">{text}</span>
      </span>
    </div>
  );
}
