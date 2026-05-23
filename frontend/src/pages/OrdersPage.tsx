import { CalendarDays, PackageCheck, Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/shared/api/client";
import type { Order, Paginated } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";

const statusMap: Record<string, { label: string; tone: string; step: number }> = {
  new: { label: "Новый", tone: "bg-zinc-100 text-zinc-700", step: 1 },
  paid: { label: "Оплачен", tone: "bg-emerald-50 text-emerald-700", step: 2 },
  assembling: { label: "Комплектуется", tone: "bg-blue-50 text-blue-700", step: 3 },
  shipped: { label: "В доставке", tone: "bg-amber-50 text-amber-700", step: 4 },
  done: { label: "Завершен", tone: "bg-emerald-50 text-emerald-700", step: 5 },
  canceled: { label: "Отменен", tone: "bg-red-50 text-red-700", step: 0 },
};

export function OrdersPage() {
  const { data, isError } = useQuery({ queryKey: ["orders"], queryFn: async () => (await api.get<Paginated<Order>>("/orders/")).data, retry: false });
  const orders = data?.results ?? [];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Личный кабинет / Заказы</p>
          <h1 className="mt-2 text-3xl font-black">Мои заказы</h1>
          <p className="mt-1 text-sm text-zinc-500">История покупок, статусы, состав заказа и оплата.</p>
        </div>
        <Link to="/catalog"><Button variant="outline">Продолжить покупки</Button></Link>
      </div>

      {isError && <AuthBox />}
      {!isError && orders.length === 0 && <EmptyOrders />}

      <div className="grid gap-4">
        {orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = statusMap[order.status] ?? statusMap.new;
  return (
    <article className="rounded-md border border-brand-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-line pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black">Заказ #{order.id}</h2>
            <span className={`rounded px-2 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><CalendarDays size={16} /> {new Date(order.created_at).toLocaleDateString("ru-RU")}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{Number(order.total).toLocaleString("ru-RU")} ₽</div>
          <p className="text-sm text-zinc-500">{paymentLabel(order.payment_status)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-md bg-brand-muted p-3 text-sm">
              <div>
                <strong>{item.title}</strong>
                <p className="text-zinc-500">{item.quantity} × {Number(item.price).toLocaleString("ru-RU")} ₽</p>
              </div>
              <span className="font-bold">{Number(item.total).toLocaleString("ru-RU")} ₽</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-bold">Статус доставки</h3>
          <div className="mt-4 grid gap-3">
            {["Оплачен", "Комплектуется", "Передан в доставку", "Получен"].map((label, index) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${status.step > index + 1 ? "bg-brand-red text-white" : "bg-brand-muted text-zinc-500"}`}>
                  {index < 2 ? <PackageCheck size={16} /> : <Truck size={16} />}
                </span>
                <span className={status.step > index + 1 ? "font-semibold" : "text-zinc-500"}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function AuthBox() {
  return (
    <div className="rounded-md border border-brand-line p-8 text-center">
      <h2 className="text-2xl font-black">Нужно войти</h2>
      <p className="mt-2 text-zinc-500">История заказов доступна после авторизации.</p>
      <Link to="/login"><Button className="mt-5">Войти</Button></Link>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-md border border-dashed border-brand-line p-8 text-center">
      <h2 className="text-2xl font-black">Заказов пока нет</h2>
      <p className="mt-2 text-zinc-500">Когда вы оформите заказ, здесь появится его состав и статус.</p>
      <Link to="/catalog"><Button className="mt-5">Перейти в каталог</Button></Link>
    </div>
  );
}

function paymentLabel(status: string) {
  return ({ pending: "Ожидает оплаты", paid: "Оплачен", failed: "Ошибка оплаты" } as Record<string, string>)[status] ?? status;
}
