import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const groups = [
  {
    title: "Покупателям",
    links: ["Доставка", "Оплата", "Возврат", "Гарантия", "Сборка мебели", "Рассрочка"],
  },
  {
    title: "Каталог",
    links: ["Диваны", "Кровати", "Шкафы", "Кухни", "Прихожие", "Офисная мебель"],
  },
  {
    title: "Компания",
    links: ["О магазине", "Бренды", "Акции", "Отзывы", "Контакты", "Поставщикам"],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950 text-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <Link to="/" className="text-3xl font-black text-brand-red">FM</Link>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-2"><Phone size={16} /> 8 800 000-00-00</span>
            <span className="flex items-center gap-2"><Mail size={16} /> support@example.local</span>
            <span className="flex items-center gap-2"><MapPin size={16} /> Ижевск, доставка по России</span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <nav key={group.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">{group.title}</h3>
              <div className="mt-4 grid gap-2">
                {group.links.map((item) => (
                  <Link key={item} to={item === "Акции" ? "/promotions" : item === "Бренды" ? "/brands" : "/catalog"} className="text-sm text-zinc-400 transition hover:text-white">
                    {item}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-zinc-500">
          <span>© 2026 Furniture Market</span>
          <div className="flex gap-4">
            <span>Политика конфиденциальности</span>
            <span>Публичная оферта</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
