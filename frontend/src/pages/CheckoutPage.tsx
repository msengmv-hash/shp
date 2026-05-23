import { Check, CreditCard, Home, MapPin, PackageCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/features/auth/model";
import { useCart } from "@/features/cart/model";
import { api } from "@/shared/api/client";
import type { Address, Paginated } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToastStore } from "@/shared/ui/toast";

interface CheckoutForm {
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  comment: string;
}

interface AddressForm {
  title: string;
  city: string;
  street: string;
  apartment: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const access = useAuthStore((state) => state.access);
  const push = useToastStore((state) => state.push);
  const queryClient = useQueryClient();
  const { data: cart } = useCart();
  const items = cart?.items ?? [];
  const subtotal = Number(cart?.total ?? 0);
  const delivery = subtotal > 0 && subtotal < 50000 ? 990 : 0;
  const total = subtotal + delivery;
  const { register, handleSubmit, setValue, watch } = useForm<CheckoutForm>();
  const addressForm = useForm<AddressForm>({ defaultValues: { title: "Дом" } });
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  const addresses = useQuery({
    queryKey: ["addresses"],
    enabled: Boolean(access),
    queryFn: async () => (await api.get<Paginated<Address>>("/addresses/")).data,
  });

  const createAddress = useMutation({
    mutationFn: async (payload: AddressForm) => (await api.post<Address>("/addresses/", payload)).data,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddress(address.id);
      setValue("city", address.city);
      setValue("address", formatAddress(address));
      push("Адрес добавлен", "success");
      addressForm.reset({ title: "Дом", city: "", street: "", apartment: "" });
    },
  });

  const checkout = useMutation({
    mutationFn: async (payload: CheckoutForm) => (await api.post("/orders/", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      push("Заказ оформлен и оплачен", "success");
      navigate("/orders");
    },
    onError: () => push("Не удалось оформить заказ. Проверьте данные, адрес и корзину", "error"),
  });

  const selectedAddressObject = useMemo(() => addresses.data?.results.find((item) => item.id === selectedAddress), [addresses.data, selectedAddress]);

  if (!access) {
    return <AuthRequired />;
  }

  if (!items.length) {
    return (
      <div className="container-page py-8">
        <h1 className="text-3xl font-black">Оформление заказа</h1>
        <div className="mt-6 rounded-md border border-brand-line p-8 text-center">
          <h2 className="text-2xl font-black">Корзина пустая</h2>
          <p className="mt-2 text-zinc-500">Добавьте товары, чтобы перейти к оформлению.</p>
          <Link to="/catalog"><Button className="mt-5">В каталог</Button></Link>
        </div>
      </div>
    );
  }

  function selectAddress(address: Address) {
    setSelectedAddress(address.id);
    setValue("city", address.city);
    setValue("address", formatAddress(address));
  }

  function submit(data: CheckoutForm) {
    if (!watch("city") || !watch("address")) {
      push("Выберите сохраненный адрес или добавьте новый", "error");
      return;
    }
    checkout.mutate(data);
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm text-zinc-500">Корзина / Оформление / Оплата</p>
        <h1 className="mt-2 text-3xl font-black">Оформление заказа</h1>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <Step active done icon={<Home size={18} />} title="Контакты" />
        <Step active={Boolean(selectedAddressObject)} done={Boolean(selectedAddressObject)} icon={<Truck size={18} />} title="Доставка" />
        <Step active={false} done={false} icon={<CreditCard size={18} />} title="Оплата" />
      </div>

      <form className="grid gap-6 lg:grid-cols-[1fr_380px]" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-5">
          <section className="rounded-md border border-brand-line bg-white p-5">
            <h2 className="text-xl font-black">1. Контактные данные</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input placeholder="Имя и фамилия" {...register("customer_name", { required: true })} />
              <Input placeholder="Телефон" {...register("phone", { required: true })} />
              <Input className="md:col-span-2" placeholder="Email" type="email" {...register("email", { required: true })} />
            </div>
          </section>

          <section className="rounded-md border border-brand-line bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black">2. Адрес доставки</h2>
              {selectedAddressObject && <span className="text-sm font-semibold text-emerald-600">Адрес выбран</span>}
            </div>
            <div className="mt-4 grid gap-3">
              {addresses.data?.results.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={`rounded-md border p-4 text-left transition ${selectedAddress === address.id ? "border-brand-red bg-red-50" : "border-brand-line hover:border-zinc-300"}`}
                  onClick={() => selectAddress(address)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <strong className="flex items-center gap-2"><MapPin size={18} /> {address.title}</strong>
                    {selectedAddress === address.id && <Check size={18} className="text-brand-red" />}
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{formatAddress(address)}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-md bg-brand-muted p-4">
              <h3 className="font-bold">Добавить новый адрес</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input placeholder="Название" {...addressForm.register("title", { required: true })} />
                <Input placeholder="Город" {...addressForm.register("city", { required: true })} />
                <Input className="md:col-span-2" placeholder="Улица и дом" {...addressForm.register("street", { required: true })} />
                <Input placeholder="Квартира" {...addressForm.register("apartment")} />
                <Button type="button" variant="secondary" onClick={addressForm.handleSubmit((payload) => createAddress.mutate(payload))}>Сохранить адрес</Button>
              </div>
            </div>

            <input type="hidden" {...register("city", { required: true })} />
            <input type="hidden" {...register("address", { required: true })} />
          </section>

          <section className="rounded-md border border-brand-line bg-white p-5">
            <h2 className="text-xl font-black">3. Комментарий</h2>
            <textarea className="mt-4 min-h-28 w-full rounded-md border border-brand-line p-3 text-sm" placeholder="Подъезд, этаж, удобное время доставки" {...register("comment")} />
          </section>
        </div>

        <aside className="h-max rounded-md border border-brand-line bg-white p-5 shadow-soft lg:sticky lg:top-28">
          <h2 className="text-xl font-black">Итого</h2>
          <div className="mt-4 grid gap-3 border-b border-brand-line pb-4 text-sm">
            <SummaryRow label="Товары" value={`${subtotal.toLocaleString("ru-RU")} ₽`} />
            <SummaryRow label="Доставка" value={delivery ? `${delivery.toLocaleString("ru-RU")} ₽` : "Бесплатно"} />
            <SummaryRow label="Позиций" value={`${items.length}`} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-zinc-500">К оплате</span>
            <span className="text-3xl font-black">{total.toLocaleString("ru-RU")} ₽</span>
          </div>
          <Button className="mt-5 h-12 w-full" disabled={checkout.isPending || !selectedAddressObject}>Подтвердить и оплатить</Button>
          <p className="mt-3 text-xs leading-5 text-zinc-500">Оплата в локальной версии проходит как mock-платеж. После подтверждения заказ появится в истории.</p>
        </aside>
      </form>
    </div>
  );
}

function Step({ icon, title, active, done }: { icon: ReactNode; title: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-md border p-4 ${active ? "border-brand-red bg-red-50" : "border-brand-line bg-white"}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-full ${done ? "bg-brand-red text-white" : "bg-white text-zinc-700"}`}>{done ? <Check size={18} /> : icon}</span>
      <span className="font-bold">{title}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span className="text-zinc-500">{label}</span><span className="font-semibold">{value}</span></div>;
}

function formatAddress(address: Address) {
  return `${address.city}, ${address.street}${address.apartment ? `, кв. ${address.apartment}` : ""}`;
}

function AuthRequired() {
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">Оформление заказа</h1>
      <div className="mt-6 rounded-md border border-brand-line p-8 text-center">
        <h2 className="text-2xl font-black">Нужно войти</h2>
        <p className="mt-2 text-zinc-500">Адреса доставки и история заказов сохраняются в личном кабинете.</p>
        <Link to="/login"><Button className="mt-5">Войти</Button></Link>
      </div>
    </div>
  );
}
