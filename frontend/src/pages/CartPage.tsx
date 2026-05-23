import { ArrowRight, PackageCheck, ShieldCheck, Trash2, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/features/cart/model";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const deliveryPrice = 990;

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const items = cart?.items ?? [];
  const subtotal = Number(cart?.total ?? 0);
  const delivery = subtotal > 0 && subtotal < 50000 ? deliveryPrice : 0;
  const total = subtotal + delivery;

  if (isLoading) {
    return <div className="container-page py-8"><Skeleton className="h-[520px]" /></div>;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Главная / Корзина</p>
          <h1 className="mt-2 text-3xl font-black">Корзина</h1>
          <p className="mt-1 text-sm text-zinc-500">{items.length ? `${items.length} позиций в заказе` : "Добавьте товары из каталога"}</p>
        </div>
        <Link to="/catalog" className="text-sm font-semibold text-brand-red">Продолжить покупки</Link>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Корзина пустая" text="Выберите мебель в каталоге, добавьте ее в корзину и вернитесь к оформлению." action="Перейти в каталог" to="/catalog" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="grid gap-3">
            {items.map((item) => (
              <article key={item.id} className="grid gap-4 rounded-md border border-brand-line bg-white p-4 sm:grid-cols-[112px_1fr] lg:grid-cols-[128px_1fr_170px]">
                <Link to={`/product/${item.product_detail.slug}`} className="block overflow-hidden rounded bg-brand-muted">
                  <img src={item.product_detail.image} alt={item.product_detail.title} className="aspect-square h-full w-full object-cover" />
                </Link>
                <div>
                  <Link to={`/product/${item.product_detail.slug}`} className="font-bold hover:text-brand-red">{item.product_detail.title}</Link>
                  <p className="mt-2 text-sm text-zinc-500">{item.product_detail.brand.title} · {item.product_detail.category.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">В наличии: {item.product_detail.stock} шт.</span>
                    {item.product_detail.discount_percent > 0 && <span className="rounded bg-red-50 px-2 py-1 text-brand-red">Скидка {item.product_detail.discount_percent}%</span>}
                  </div>
                  <button className="mt-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-brand-red" onClick={() => remove.mutate({ item: item.id })}>
                    <Trash2 size={16} /> Удалить
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1 lg:block">
                  <div className="flex w-32 items-center rounded-md border border-brand-line">
                    <button className="h-10 flex-1 hover:bg-brand-muted" onClick={() => item.quantity > 1 ? update.mutate({ item: item.id, quantity: item.quantity - 1 }) : remove.mutate({ item: item.id })}>-</button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <button className="h-10 flex-1 hover:bg-brand-muted" onClick={() => update.mutate({ item: item.id, quantity: item.quantity + 1 })}>+</button>
                  </div>
                  <div className="mt-3 text-lg font-black">{Number(item.total).toLocaleString("ru-RU")} ₽</div>
                  <div className="text-xs text-zinc-500">{Number(item.product_detail.price).toLocaleString("ru-RU")} ₽ за шт.</div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-max rounded-md border border-brand-line bg-white p-5 shadow-soft lg:sticky lg:top-28">
            <h2 className="text-xl font-black">Ваш заказ</h2>
            <div className="mt-5 grid gap-3 border-b border-brand-line pb-5 text-sm">
              <Row label="Товары" value={`${subtotal.toLocaleString("ru-RU")} ₽`} />
              <Row label="Доставка" value={delivery ? `${delivery.toLocaleString("ru-RU")} ₽` : "Бесплатно"} />
              <Row label="Скидки" value={items.some((item) => item.product_detail.old_price) ? "Учтены в цене" : "Нет"} />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-sm text-zinc-500">Итого</span>
              <span className="text-3xl font-black">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
            <Link to="/checkout"><Button className="mt-5 h-12 w-full">Перейти к оформлению <ArrowRight size={18} /></Button></Link>
            <div className="mt-5 grid gap-3 text-sm text-zinc-600">
              <Benefit icon={<Truck size={18} />} text="Доставка по адресу или самовывоз" />
              <Benefit icon={<PackageCheck size={18} />} text="Сборка мебели при получении" />
              <Benefit icon={<ShieldCheck size={18} />} text="Гарантия и проверка комплектности" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-zinc-500">{label}</span><span className="font-semibold">{value}</span></div>;
}

function Benefit({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-2">{icon}<span>{text}</span></div>;
}

function EmptyState({ title, text, action, to }: { title: string; text: string; action: string; to: string }) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-md border border-dashed border-brand-line bg-white p-8 text-center">
      <div>
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">{text}</p>
        <Link to={to}><Button className="mt-6">{action}</Button></Link>
      </div>
    </div>
  );
}
