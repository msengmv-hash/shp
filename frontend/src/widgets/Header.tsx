import { Heart, Home, MapPin, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useProfile } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/model";
import { useCart } from "@/features/cart/model";
import { api } from "@/shared/api/client";
import type { Category } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopCatalogOpen, setDesktopCatalogOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const access = useAuthStore((state) => state.access);
  const { data: profile } = useProfile();
  const canAdmin = Boolean(profile && (profile.is_staff || ["admin", "manager"].includes(profile.role)));
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.get<Category[]>("/categories/")).data });
  const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-line bg-white/95 backdrop-blur">
        <div className="bg-brand-muted text-xs text-zinc-600">
          <div className="container-page flex h-8 items-center justify-between md:h-9">
            <div className="flex items-center gap-2"><MapPin size={14} /> Ижевск</div>
            <nav className="hidden gap-5 md:flex">
              <NavLink to="/promotions">Акции</NavLink>
              <NavLink to="/brands">Бренды</NavLink>
              <NavLink to="/checkout">Доставка и оплата</NavLink>
              <span>8 800 000-00-00</span>
            </nav>
          </div>
        </div>

        <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-4">
          <button className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
            <Menu size={22} />
          </button>
          <Link to="/" className="text-2xl font-black tracking-normal text-brand-red">FM</Link>
          <Button className="hidden md:inline-flex" onClick={() => setDesktopCatalogOpen((value) => !value)}>
            <Menu size={18} /> Каталог
          </Button>
          <form className="hidden flex-1 md:flex" onSubmit={submit}>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск мебели, бренда или артикула" className="rounded-r-none" />
            <Button className="rounded-l-none px-4" aria-label="Найти"><Search size={18} /></Button>
          </form>
          <Link to="/favorites" className="hidden h-11 w-11 items-center justify-center rounded-md hover:bg-brand-muted md:flex"><Heart size={21} /></Link>
          {canAdmin && <Link to="/admin-panel" className="hidden rounded-md border border-brand-line px-3 py-2 text-sm font-bold hover:border-brand-red md:block">Админка</Link>}
          <Link to={access ? "/profile" : "/login"} className="hidden h-11 w-11 items-center justify-center rounded-md hover:bg-brand-muted md:flex"><User size={21} /></Link>
          <Link to="/cart" className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-md hover:bg-brand-muted md:ml-0">
            <ShoppingCart size={21} />
            {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-brand-red px-1.5 text-xs font-bold text-white">{count}</span>}
          </Link>
        </div>

        <form className="container-page flex pb-3 md:hidden" onSubmit={submit}>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск мебели" className="rounded-r-none" />
          <Button className="rounded-l-none px-4" aria-label="Найти"><Search size={18} /></Button>
        </form>
        {desktopCatalogOpen && <DesktopCatalog categories={categories ?? []} onClose={() => setDesktopCatalogOpen(false)} />}
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories ?? []} canAdmin={canAdmin} access={Boolean(access)} count={count} />
      <MobileBottomNav count={count} canAdmin={canAdmin} access={Boolean(access)} />
    </>
  );
}

function DesktopCatalog({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  return (
    <div className="hidden border-t border-brand-line bg-white shadow-soft md:block">
      <div className="container-page grid gap-6 py-6 md:grid-cols-4">
        {categories.map((category) => (
          <div key={category.id}>
            <Link to={`/catalog?category=${category.slug}`} onClick={onClose} className="font-bold hover:text-brand-red">{category.title}</Link>
            <div className="mt-3 grid gap-2 text-sm text-zinc-600">
              {category.children.map((child) => <Link key={child.id} to={`/catalog?category=${child.slug}`} onClick={onClose} className="hover:text-brand-red">{child.title}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose, categories, canAdmin, access, count }: { open: boolean; onClose: () => void; categories: Category[]; canAdmin: boolean; access: boolean; count: number }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть меню" />
      <aside className="absolute left-0 top-0 flex h-full w-[min(90vw,380px)] flex-col bg-white shadow-soft">
        <div className="flex h-16 items-center justify-between border-b border-brand-line px-4">
          <Link to="/" onClick={onClose} className="text-2xl font-black text-brand-red">FM</Link>
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-md" onClick={onClose} aria-label="Закрыть меню"><X size={22} /></button>
        </div>
        <div className="grid gap-2 border-b border-brand-line p-4">
          <MobileLink to="/catalog" onClick={onClose} icon={<Menu size={18} />} label="Каталог" />
          <MobileLink to="/favorites" onClick={onClose} icon={<Heart size={18} />} label="Избранное" />
          <MobileLink to={access ? "/profile" : "/login"} onClick={onClose} icon={<User size={18} />} label={access ? "Профиль" : "Войти"} />
          <MobileLink to="/cart" onClick={onClose} icon={<ShoppingCart size={18} />} label={`Корзина${count ? ` · ${count}` : ""}`} />
          {canAdmin && <MobileLink to="/admin-panel" onClick={onClose} icon={<ShieldIcon />} label="Админка" />}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-bold uppercase text-zinc-500">Категории</h3>
          <div className="mt-4 grid gap-5">
            {categories.map((category) => (
              <div key={category.id}>
                <Link to={`/catalog?category=${category.slug}`} onClick={onClose} className="font-bold">{category.title}</Link>
                <div className="mt-2 grid gap-2 pl-3 text-sm text-zinc-600">
                  {category.children.map((child) => <Link key={child.id} to={`/catalog?category=${child.slug}`} onClick={onClose}>{child.title}</Link>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MobileBottomNav({ count, canAdmin, access }: { count: number; canAdmin: boolean; access: boolean }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-brand-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <BottomLink to="/" icon={<Home size={20} />} label="Главная" />
      <BottomLink to="/catalog" icon={<Menu size={20} />} label="Каталог" />
      <BottomLink to="/favorites" icon={<Heart size={20} />} label="Избранное" />
      <BottomLink to={canAdmin ? "/admin-panel" : access ? "/profile" : "/login"} icon={<User size={20} />} label={canAdmin ? "Админ" : "Профиль"} />
      <BottomLink to="/cart" icon={<ShoppingCart size={20} />} label={count ? `Корзина ${count}` : "Корзина"} />
    </nav>
  );
}

function MobileLink({ to, onClick, icon, label }: { to: string; onClick: () => void; icon: ReactNode; label: string }) {
  return <Link to={to} onClick={onClick} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold hover:bg-brand-muted">{icon}{label}</Link>;
}

function BottomLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return <Link to={to} className="flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-zinc-700">{icon}<span>{label}</span></Link>;
}

function ShieldIcon() {
  return <span className="grid h-[18px] w-[18px] place-items-center rounded bg-brand-red text-[10px] font-black text-white">A</span>;
}
