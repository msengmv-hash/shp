import { BarChart3, Boxes, ClipboardList, FolderTree, Save, ShieldAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { useProfile } from "@/features/auth/api";
import { api } from "@/shared/api/client";
import type { Brand, Category, Order, Paginated, Product, StorefrontSummary, User } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToastStore } from "@/shared/ui/toast";

type Tab = "overview" | "products" | "refs" | "orders" | "users";

interface ProductForm {
  title: string;
  sku: string;
  brand: number;
  category: number;
  description: string;
  image_url: string;
  price: string;
  old_price: string;
  stock: number;
  status: string;
}

interface RefForm {
  title: string;
  description?: string;
}

interface UserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
}

const productStatuses = [
  ["active", "Активен"],
  ["draft", "Черновик"],
  ["archived", "Архив"],
];

const orderStatuses = [
  ["new", "Новый"],
  ["paid", "Оплачен"],
  ["assembling", "Комплектуется"],
  ["shipped", "В доставке"],
  ["done", "Завершен"],
  ["canceled", "Отменен"],
];

const roleOptions = [
  ["customer", "Покупатель"],
  ["manager", "Менеджер"],
  ["admin", "Администратор"],
];

export function AdminPanelPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const { data: profile } = useProfile();
  const canManage = Boolean(profile && (profile.is_staff || ["admin", "manager"].includes(profile.role)));
  const isSuperAdmin = Boolean(profile?.is_superuser);

  if (!profile) {
    return <Gate title="Нужен вход" text="Войдите под администратором или менеджером." />;
  }

  if (!canManage) {
    return <Gate title="Нет доступа" text="Панель управления доступна только менеджерам и администраторам." />;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Администрирование</p>
          <h1 className="mt-2 text-3xl font-black">Панель управления сайтом</h1>
        </div>
        <a href="http://127.0.0.1:8000/admin/" target="_blank" className="text-sm font-semibold text-brand-red">Django Admin</a>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<BarChart3 size={18} />} label="Обзор" />
        <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<Boxes size={18} />} label="Товары" />
        <TabButton active={tab === "refs"} onClick={() => setTab("refs")} icon={<FolderTree size={18} />} label="Справочники" />
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList size={18} />} label="Заказы" />
        {isSuperAdmin && <TabButton active={tab === "users"} onClick={() => setTab("users")} icon={<Users size={18} />} label="Пользователи" />}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "products" && <ProductsAdmin />}
      {tab === "refs" && <RefsAdmin />}
      {tab === "orders" && <OrdersAdmin />}
      {tab === "users" && isSuperAdmin && <UsersAdmin />}
    </div>
  );
}

function Overview() {
  const { data } = useQuery({ queryKey: ["storefront"], queryFn: async () => (await api.get<StorefrontSummary>("/storefront/")).data });
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[
        ["Товаров", data?.products],
        ["Категорий", data?.categories],
        ["Брендов", data?.brands],
        ["Акций", data?.promotions],
      ].map(([label, value]) => (
        <div key={String(label)} className="rounded-md border border-brand-line bg-white p-5">
          <div className="text-3xl font-black">{value ?? "..."}</div>
          <div className="mt-1 text-sm text-zinc-500">{label}</div>
        </div>
      ))}
      <div className="rounded-md border border-brand-line bg-white p-5 md:col-span-4">
        <h2 className="text-xl font-black">Популярные разделы</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {data?.top_categories.map((item) => <span key={item.slug} className="rounded-full bg-brand-muted px-3 py-1 text-sm">{item.title}: {item.products_count}</span>)}
        </div>
      </div>
    </div>
  );
}

function ProductsAdmin() {
  const queryClient = useQueryClient();
  const push = useToastStore((state) => state.push);
  const { register, handleSubmit, reset } = useForm<ProductForm>({ defaultValues: { status: "active", stock: 1 } });
  const { data: products } = useQuery({ queryKey: ["admin-products"], queryFn: async () => (await api.get<Paginated<Product>>("/products/", { params: { include: "all", page_size: 12 } })).data });
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: async () => (await api.get<Brand[]>("/brands/")).data });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: async () => (await api.get<Category[]>("/categories/", { params: { all: true } })).data });
  const flatCategories = useMemo(() => flattenCategories(categories ?? []), [categories]);

  const create = useMutation({
    mutationFn: async (payload: ProductForm) => (await api.post("/products/", normalizeProduct(payload))).data,
    onSuccess: () => {
      reset({ status: "active", stock: 1 });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      push("Товар создан", "success");
    },
    onError: () => push("Не удалось создать товар", "error"),
  });

  const update = useMutation({
    mutationFn: async ({ product, payload }: { product: Product; payload: Partial<ProductForm> }) => (await api.patch(`/products/${product.slug}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      push("Товар обновлен", "success");
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form className="h-max rounded-md border border-brand-line bg-white p-5" onSubmit={handleSubmit((payload) => create.mutate(payload))}>
        <h2 className="text-xl font-black">Новый товар</h2>
        <div className="mt-4 grid gap-3">
          <Input placeholder="Название" {...register("title", { required: true })} />
          <Input placeholder="SKU" {...register("sku", { required: true })} />
          <select className="h-11 rounded-md border border-brand-line px-3" {...register("brand", { required: true, valueAsNumber: true })}>
            <option value="">Бренд</option>
            {brands?.map((brand) => <option key={brand.id} value={brand.id}>{brand.title}</option>)}
          </select>
          <select className="h-11 rounded-md border border-brand-line px-3" {...register("category", { required: true, valueAsNumber: true })}>
            <option value="">Категория</option>
            {flatCategories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
          </select>
          <Input placeholder="Цена" {...register("price", { required: true })} />
          <Input placeholder="Старая цена" {...register("old_price")} />
          <Input placeholder="Остаток" type="number" {...register("stock", { valueAsNumber: true })} />
          <Input placeholder="URL изображения" {...register("image_url")} />
          <textarea className="min-h-24 rounded-md border border-brand-line p-3 text-sm" placeholder="Описание" {...register("description", { required: true })} />
          <select className="h-11 rounded-md border border-brand-line px-3" {...register("status")}>
            {productStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Button disabled={create.isPending}><Save size={18} /> Создать товар</Button>
        </div>
      </form>

      <div className="grid gap-3">
        {products?.results.map((product) => (
          <article key={product.id} className="rounded-md border border-brand-line bg-white p-4">
            <div className="grid gap-4 md:grid-cols-[84px_1fr] xl:grid-cols-[84px_1fr_260px]">
              <img src={product.image} alt="" className="aspect-square rounded object-cover" />
              <div>
                <Link to={`/product/${product.slug}`} className="font-bold hover:text-brand-red">{product.title}</Link>
                <p className="mt-1 text-sm text-zinc-500">{product.sku} · {product.brand.title} · {product.category.title}</p>
                <p className="mt-2 text-sm">Цена: <b>{Number(product.price).toLocaleString("ru-RU")} ₽</b>, остаток: <b>{product.stock}</b></p>
              </div>
              <div className="grid gap-2">
                <Input defaultValue={product.price} onBlur={(event) => update.mutate({ product, payload: { price: event.target.value } })} />
                <Input defaultValue={product.stock} type="number" onBlur={(event) => update.mutate({ product, payload: { stock: Number(event.target.value) } })} />
                <select className="h-10 rounded-md border border-brand-line px-3 text-sm" defaultValue={product.status ?? "active"} onChange={(event) => update.mutate({ product, payload: { status: event.target.value } })}>
                  {productStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RefsAdmin() {
  const queryClient = useQueryClient();
  const push = useToastStore((state) => state.push);
  const brandForm = useForm<RefForm>();
  const categoryForm = useForm<RefForm>();
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: async () => (await api.get<Brand[]>("/brands/")).data });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: async () => (await api.get<Category[]>("/categories/", { params: { all: true } })).data });

  const createBrand = useMutation({
    mutationFn: async (payload: RefForm) => (await api.post("/brands/", payload)).data,
    onSuccess: () => {
      brandForm.reset();
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      push("Бренд создан", "success");
    },
  });

  const createCategory = useMutation({
    mutationFn: async (payload: RefForm) => (await api.post("/categories/", payload)).data,
    onSuccess: () => {
      categoryForm.reset();
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      push("Категория создана", "success");
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-md border border-brand-line bg-white p-5">
        <h2 className="text-xl font-black">Бренды</h2>
        <form className="mt-4 grid gap-3" onSubmit={brandForm.handleSubmit((payload) => createBrand.mutate(payload))}>
          <Input placeholder="Название бренда" {...brandForm.register("title", { required: true })} />
          <Input placeholder="Описание" {...brandForm.register("description")} />
          <Button>Добавить бренд</Button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">{brands?.map((brand) => <span key={brand.id} className="rounded-full bg-brand-muted px-3 py-1 text-sm">{brand.title}</span>)}</div>
      </section>
      <section className="rounded-md border border-brand-line bg-white p-5">
        <h2 className="text-xl font-black">Категории</h2>
        <form className="mt-4 grid gap-3" onSubmit={categoryForm.handleSubmit((payload) => createCategory.mutate(payload))}>
          <Input placeholder="Название категории" {...categoryForm.register("title", { required: true })} />
          <Button>Добавить категорию</Button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">{flattenCategories(categories ?? []).map((category) => <span key={category.id} className="rounded-full bg-brand-muted px-3 py-1 text-sm">{category.title}</span>)}</div>
      </section>
    </div>
  );
}

function OrdersAdmin() {
  const queryClient = useQueryClient();
  const push = useToastStore((state) => state.push);
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await api.get<Paginated<Order>>("/orders/", { params: { include: "all" } })).data });
  const setStatus = useMutation({
    mutationFn: async ({ order, status }: { order: Order; status: string }) => (await api.post(`/orders/${order.id}/set_status/`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      push("Статус заказа обновлен", "success");
    },
  });

  return (
    <div className="grid gap-3">
      {data?.results.map((order) => (
        <article key={order.id} className="rounded-md border border-brand-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Заказ #{order.id}</h2>
              <p className="mt-1 text-sm text-zinc-500">{order.customer_name} · {order.items.length} позиций</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{Number(order.total).toLocaleString("ru-RU")} ₽</div>
              <select className="mt-2 h-10 rounded-md border border-brand-line px-3 text-sm" value={order.status} onChange={(event) => setStatus.mutate({ order, status: event.target.value })}>
                {orderStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function UsersAdmin() {
  const queryClient = useQueryClient();
  const push = useToastStore((state) => state.push);
  const { register, handleSubmit, reset, watch, setValue } = useForm<UserForm>({ defaultValues: { role: "manager", is_staff: true, is_superuser: false, is_active: true } });
  const { data } = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get<Paginated<User>>("/admin-users/")).data });

  const create = useMutation({
    mutationFn: async (payload: UserForm) => (await api.post<User>("/admin-users/", normalizeUser(payload))).data,
    onSuccess: () => {
      reset({ role: "manager", is_staff: true, is_superuser: false, is_active: true });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      push("Пользователь создан", "success");
    },
    onError: () => push("Не удалось создать пользователя", "error"),
  });

  const update = useMutation({
    mutationFn: async ({ user, payload }: { user: User; payload: Partial<UserForm> }) => (await api.patch(`/admin-users/${user.id}/`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      push("Пользователь обновлен", "success");
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form className="h-max rounded-md border border-brand-line bg-white p-5" onSubmit={handleSubmit((payload) => create.mutate(payload))}>
        <h2 className="text-xl font-black">Новый администратор</h2>
        <p className="mt-1 text-sm text-zinc-500">Создавать админов и менять роли может только супер-админ.</p>
        <div className="mt-4 grid gap-3">
          <Input placeholder="Логин" {...register("username", { required: true })} />
          <Input placeholder="Email" type="email" {...register("email", { required: true })} />
          <Input placeholder="Пароль" type="password" {...register("password", { required: true, minLength: 8 })} />
          <select className="h-11 rounded-md border border-brand-line px-3" {...register("role")} onChange={(event) => {
            const role = event.target.value;
            setValue("role", role);
            setValue("is_staff", role !== "customer");
            setValue("is_superuser", role === "admin" && watch("is_superuser"));
          }}>
            {roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_staff")} /> Доступ в панель управления</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_superuser")} /> Супер-админ</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("is_active")} /> Активен</label>
          <Button disabled={create.isPending}>Создать пользователя</Button>
        </div>
      </form>

      <div className="grid gap-3">
        {data?.results.map((user) => (
          <article key={user.id} className="rounded-md border border-brand-line bg-white p-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <div>
                <h3 className="font-bold">{user.username}</h3>
                <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-brand-muted px-2 py-1">{roleLabel(user.role)}</span>
                  {user.is_superuser && <span className="rounded bg-red-50 px-2 py-1 font-bold text-brand-red">Супер-админ</span>}
                  {user.is_staff && <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">Staff</span>}
                  {!user.is_active && <span className="rounded bg-zinc-100 px-2 py-1 text-zinc-500">Заблокирован</span>}
                </div>
              </div>
              <div className="grid gap-2">
                <select className="h-10 rounded-md border border-brand-line px-3 text-sm" defaultValue={user.role} onChange={(event) => update.mutate({ user, payload: { role: event.target.value, is_staff: event.target.value !== "customer" } })}>
                  {roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Toggle label="Staff" checked={user.is_staff} onChange={(checked) => update.mutate({ user, payload: { is_staff: checked } })} />
                  <Toggle label="Super" checked={user.is_superuser} onChange={(checked) => update.mutate({ user, payload: { is_superuser: checked } })} />
                  <Toggle label="Active" checked={user.is_active} onChange={(checked) => update.mutate({ user, payload: { is_active: checked } })} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center gap-1 rounded-md border border-brand-line px-2 py-2"><input type="checkbox" defaultChecked={checked} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-bold ${active ? "border-brand-red bg-red-50 text-brand-red" : "border-brand-line bg-white"}`} onClick={onClick}>
      {icon} {label}
    </button>
  );
}

function Gate({ title, text }: { title: string; text: string }) {
  return (
    <div className="container-page py-8">
      <div className="grid min-h-[420px] place-items-center rounded-md border border-brand-line p-8 text-center">
        <div>
          <ShieldAlert className="mx-auto text-brand-red" size={42} />
          <h1 className="mt-4 text-3xl font-black">{title}</h1>
          <p className="mt-2 text-zinc-500">{text}</p>
          <Link to="/login"><Button className="mt-5">Войти</Button></Link>
        </div>
      </div>
    </div>
  );
}

function flattenCategories(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  for (const category of categories.flatMap((item) => [item, ...flattenCategories(item.children ?? [])])) {
    map.set(category.id, category);
  }
  return Array.from(map.values());
}

function normalizeProduct(payload: ProductForm) {
  return {
    ...payload,
    old_price: payload.old_price || null,
    stock: Number(payload.stock || 0),
  };
}

function normalizeUser(payload: UserForm) {
  return {
    ...payload,
    is_staff: Boolean(payload.is_staff || payload.role !== "customer"),
    is_superuser: Boolean(payload.is_superuser),
    is_active: Boolean(payload.is_active),
  };
}

function roleLabel(role: string) {
  return ({ customer: "Покупатель", manager: "Менеджер", admin: "Администратор" } as Record<string, string>)[role] ?? role;
}
