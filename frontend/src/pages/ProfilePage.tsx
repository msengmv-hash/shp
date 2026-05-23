import { Heart, LogOut, MapPin, Package, Settings, UserRound } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { useProfile } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/model";
import { api } from "@/shared/api/client";
import type { Address, Order, Paginated } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToastStore } from "@/shared/ui/toast";

interface AddressForm {
  title: string;
  city: string;
  street: string;
  apartment: string;
}

export function ProfilePage() {
  const { data: profile } = useProfile();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const push = useToastStore((state) => state.push);
  const { register, handleSubmit, reset } = useForm<AddressForm>({ defaultValues: { title: "Дом" } });
  const addresses = useQuery({ queryKey: ["addresses"], enabled: Boolean(profile), queryFn: async () => (await api.get<Paginated<Address>>("/addresses/")).data });
  const orders = useQuery({ queryKey: ["orders"], enabled: Boolean(profile), queryFn: async () => (await api.get<Paginated<Order>>("/orders/")).data, retry: false });
  const createAddress = useMutation({
    mutationFn: async (payload: AddressForm) => (await api.post<Address>("/addresses/", payload)).data,
    onSuccess: () => {
      reset({ title: "Дом", city: "", street: "", apartment: "" });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      push("Адрес сохранен", "success");
    },
  });

  if (!profile) {
    return (
      <div className="container-page py-8">
        <div className="rounded-md border border-brand-line p-8 text-center">
          <h1 className="text-3xl font-black">Личный кабинет</h1>
          <p className="mt-3 text-zinc-500">Войдите, чтобы видеть заказы, адреса и избранное.</p>
          <Link to="/login"><Button className="mt-5">Войти</Button></Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Заказов", value: orders.data?.count ?? 0, icon: <Package size={20} />, to: "/orders" },
    { label: "Адресов", value: addresses.data?.count ?? 0, icon: <MapPin size={20} />, to: "#addresses" },
    { label: "Избранное", value: "Смотреть", icon: <Heart size={20} />, to: "/favorites" },
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Главная / Личный кабинет</p>
          <h1 className="mt-2 text-3xl font-black">Личный кабинет</h1>
        </div>
        <Button variant="outline" onClick={() => { logout(); queryClient.clear(); push("Вы вышли из аккаунта", "success"); }}>
          <LogOut size={18} /> Выйти
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
        <div className="rounded-md border border-brand-line bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-red text-white"><UserRound size={30} /></div>
            <div>
              <h2 className="text-2xl font-black">{profile.first_name || profile.username}</h2>
              <p className="text-sm text-zinc-500">{profile.email}</p>
              {profile.phone && <p className="text-sm text-zinc-500">{profile.phone}</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <Link key={item.label} to={item.to} className="rounded-md border border-brand-line bg-white p-5 transition hover:border-brand-red hover:shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-muted">{item.icon}</span>
                <span className="text-2xl font-black">{item.value}</span>
              </div>
              <p className="mt-4 text-sm font-semibold">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="addresses" className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="text-2xl font-black">Адреса доставки</h2>
          <div className="mt-4 grid gap-3">
            {addresses.data?.results.map((address) => (
              <article key={address.id} className="rounded-md border border-brand-line bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <strong className="flex items-center gap-2"><MapPin size={18} /> {address.title}</strong>
                  {address.is_default && <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Основной</span>}
                </div>
                <p className="mt-2 text-sm text-zinc-600">{address.city}, {address.street}{address.apartment ? `, кв. ${address.apartment}` : ""}</p>
              </article>
            ))}
            {addresses.data?.results.length === 0 && <div className="rounded-md border border-dashed border-brand-line p-6 text-sm text-zinc-500">Адресов пока нет. Добавьте адрес, чтобы checkout проходил быстрее.</div>}
          </div>
        </div>

        <form className="h-max rounded-md border border-brand-line bg-white p-5" onSubmit={handleSubmit((payload) => createAddress.mutate(payload))}>
          <h3 className="flex items-center gap-2 text-xl font-black"><Settings size={20} /> Новый адрес</h3>
          <div className="mt-4 grid gap-3">
            <Input placeholder="Название, например Дом" {...register("title", { required: true })} />
            <Input placeholder="Город" {...register("city", { required: true })} />
            <Input placeholder="Улица и дом" {...register("street", { required: true })} />
            <Input placeholder="Квартира" {...register("apartment")} />
            <Button disabled={createAddress.isPending}>Сохранить адрес</Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">Последние заказы</h2>
          <Link to="/orders" className="text-sm font-semibold text-brand-red">Все заказы</Link>
        </div>
        <div className="grid gap-3">
          {orders.data?.results.slice(0, 3).map((order) => <OrderLine key={order.id} order={order} />)}
          {orders.data?.results.length === 0 && <div className="rounded-md border border-dashed border-brand-line p-6 text-sm text-zinc-500">Заказов пока нет.</div>}
        </div>
      </section>
    </div>
  );
}

function OrderLine({ order }: { order: Order }) {
  return (
    <Link to="/orders" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-line bg-white p-4 hover:border-brand-red">
      <span className="font-bold">Заказ #{order.id}</span>
      <span className="text-sm text-zinc-500">{statusLabel(order.status)} · {paymentLabel(order.payment_status)}</span>
      <span className="text-lg font-black">{Number(order.total).toLocaleString("ru-RU")} ₽</span>
    </Link>
  );
}

function statusLabel(status: string) {
  return ({ new: "Новый", paid: "Оплачен", assembling: "Комплектуется", shipped: "В доставке", done: "Завершен", canceled: "Отменен" } as Record<string, string>)[status] ?? status;
}

function paymentLabel(status: string) {
  return ({ pending: "Ожидает оплаты", paid: "Оплачен", failed: "Ошибка оплаты" } as Record<string, string>)[status] ?? status;
}
