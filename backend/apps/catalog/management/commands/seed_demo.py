from decimal import Decimal
from random import choice, randint, sample, uniform

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.cart.models import Cart, CartItem
from apps.catalog.models import Brand, Category, Product, ProductAttribute, ProductImage, Promotion
from apps.orders.models import Order, OrderItem
from apps.reviews.models import Review
from apps.users.models import Favorite, UserAddress


ROOMS = {
    "Гостиная": ["Диваны", "Кресла", "Стенки", "ТВ-тумбы", "Журнальные столы", "Стеллажи"],
    "Спальня": ["Кровати", "Матрасы", "Шкафы", "Комоды", "Тумбы прикроватные", "Туалетные столики"],
    "Кухня": ["Кухонные гарнитуры", "Обеденные столы", "Стулья", "Барные стулья", "Буфеты"],
    "Прихожая": ["Прихожие", "Обувницы", "Вешалки", "Зеркала", "Банкетки"],
    "Детская": ["Детские кровати", "Письменные столы", "Шкафы детские", "Полки", "Комоды детские"],
    "Офис": ["Офисные кресла", "Компьютерные столы", "Офисные шкафы", "Тумбы офисные"],
    "Ванная": ["Тумбы под раковину", "Пеналы", "Зеркальные шкафы"],
    "Дача": ["Садовые кресла", "Комплекты для террасы", "Шезлонги", "Скамьи"],
}

BRANDS = [
    ("HomeLine", "Практичная корпусная мебель для квартиры"),
    ("Nordika", "Скандинавская мебель из светлых материалов"),
    ("Forma", "Современные модульные коллекции"),
    ("Loftika", "Лофт и индустриальная эстетика"),
    ("SoftRoom", "Мягкая мебель и кровати"),
    ("Mebelson", "Доступные решения для всей семьи"),
    ("WoodCraft", "Мебель с фактурой натурального дерева"),
    ("Ormatek Home", "Матрасы и товары для сна"),
]

IMAGE_BY_KIND = {
    "Диваны": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    "Кресла": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80",
    "Кровати": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "Матрасы": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
    "Шкафы": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80",
    "Комоды": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80",
    "Кухонные гарнитуры": "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    "Обеденные столы": "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&w=900&q=80",
    "Стулья": "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
    "Прихожие": "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80",
    "Зеркала": "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
    "Офисные кресла": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80",
    "Компьютерные столы": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80",
    "default": "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
}

COLLECTIONS = ["Сити", "Лофт", "Норд", "Верона", "Милан", "Асти", "Рио", "Кельн", "Орион", "Прага", "Луна", "Тоскана"]
COLORS = ["дуб сонома", "графит", "кашемир", "белый матовый", "орех", "венге", "серый", "бежевый", "оливковый"]
MATERIALS = ["ЛДСП", "МДФ", "массив сосны", "металл", "велюр", "рогожка", "экокожа", "шпон"]
REVIEW_TEXTS = [
    "Собрали быстро, выглядит аккуратно, цвет совпал с фото.",
    "Хорошее качество за свою цену, доставили в выбранный интервал.",
    "Понравилась фурнитура и понятная инструкция по сборке.",
    "Мебель смотрится дороже, чем стоит. Упаковка была целая.",
    "Размеры подошли идеально, пользоваться удобно каждый день.",
]


class Command(BaseCommand):
    help = "Bootstrap a realistic furniture catalog for an empty installation."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing commerce data before bootstrapping.")
        parser.add_argument("--products", type=int, default=360, help="How many products to create.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self.reset_data()

        User = get_user_model()
        admin, _ = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.local", "is_staff": True, "is_superuser": True, "role": "admin"},
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.role = "admin"
        admin.set_password("admin12345")
        admin.save()

        buyers = []
        for index, name in enumerate(["anna", "ivan", "maria", "pavel", "olga"], start=1):
            user, _ = User.objects.get_or_create(username=name, defaults={"email": f"{name}@example.local", "first_name": name.title()})
            user.set_password("buyer12345")
            user.save()
            buyers.append(user)

        categories = self.create_categories()
        brands = [Brand.objects.get_or_create(title=title, slug=slugify_ru(title), defaults={"description": description})[0] for title, description in BRANDS]
        created = self.create_products(categories, brands, options["products"])
        self.create_promotions(created)
        self.create_reviews(created, buyers)
        self.create_addresses(buyers)

        self.stdout.write(self.style.SUCCESS(f"Furniture catalog is ready: {Product.objects.count()} products. Admin: admin / admin12345"))

    def reset_data(self):
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        Favorite.objects.all().delete()
        Review.objects.all().delete()
        ProductAttribute.objects.all().delete()
        ProductImage.objects.all().delete()
        Promotion.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Brand.objects.all().delete()
        UserAddress.objects.all().delete()

    def create_categories(self):
        categories = []
        for sort_order, (room, children) in enumerate(ROOMS.items(), start=1):
            root, _ = Category.objects.get_or_create(
                title=room,
                slug=slugify_ru(room),
                defaults={
                    "sort_order": sort_order,
                    "image_url": IMAGE_BY_KIND.get(children[0], IMAGE_BY_KIND["default"]),
                    "seo_title": f"{room}: мебель купить онлайн",
                    "seo_description": f"Большой выбор мебели для раздела {room.lower()} с доставкой.",
                },
            )
            for child in children:
                categories.append(
                    Category.objects.get_or_create(
                        title=child,
                        slug=slugify_ru(child),
                        parent=root,
                        defaults={
                            "image_url": IMAGE_BY_KIND.get(child, IMAGE_BY_KIND["default"]),
                            "seo_title": f"{child} купить в интернет-магазине",
                            "seo_description": f"{child}: цены, отзывы, характеристики и доставка.",
                        },
                    )[0]
                )
        return categories

    def create_products(self, categories, brands, target_count):
        if Product.objects.count() >= target_count:
            return list(Product.objects.all())

        products = []
        start = Product.objects.count()
        for index in range(start, target_count):
            category = categories[index % len(categories)]
            brand = brands[index % len(brands)]
            collection = COLLECTIONS[index % len(COLLECTIONS)]
            width = randint(40, 320)
            depth = randint(35, 220)
            height = randint(35, 240)
            base = Decimal(randint(2990, 189990))
            sale = index % 3 == 0
            old_price = base + Decimal(randint(2000, 45000)) if sale else None
            title = f"{category.title} {collection} {width} см, {choice(COLORS)}"
            product = Product.objects.create(
                title=title,
                sku=f"FM-{100000 + index}",
                brand=brand,
                category=category,
                description=(
                    f"{title} — товар для современного интерьера. Подходит для ежедневного использования, "
                    f"легко сочетается с базовыми коллекциями и поставляется с понятной инструкцией по сборке."
                ),
                image_url=IMAGE_BY_KIND.get(category.title, IMAGE_BY_KIND["default"]),
                price=base,
                old_price=old_price,
                stock=randint(0, 60),
                rating=Decimal(str(round(uniform(3.8, 5.0), 2))),
                reviews_count=randint(2, 48),
                is_hit=index % 7 == 0,
                is_new=index % 11 == 0,
            )
            attrs = {
                "Ширина": f"{width} см",
                "Глубина": f"{depth} см",
                "Высота": f"{height} см",
                "Материал": choice(MATERIALS),
                "Цвет": title.split(", ")[-1],
                "Гарантия": f"{choice([12, 18, 24, 36])} месяцев",
                "Страна производства": "Россия",
            }
            for name, value in attrs.items():
                ProductAttribute.objects.create(product=product, name=name, value=value)
            products.append(product)
        return products

    def create_promotions(self, products):
        promo_specs = [
            ("Неделя мягкой мебели", "Скидки до 35% на диваны, кресла и кровати", "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"),
            ("Кухня под ключ", "Гарнитуры, столы и стулья с выгодной доставкой", "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80"),
            ("Готовим спальню", "Кровати, матрасы, шкафы и комоды в одной подборке", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"),
            ("Рабочее место", "Столы, кресла и стеллажи для домашнего офиса", "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80"),
        ]
        for title, subtitle, image_url in promo_specs:
            promo, _ = Promotion.objects.get_or_create(
                title=title,
                slug=slugify_ru(title),
                defaults={"subtitle": subtitle, "image_url": image_url},
            )
            promo.subtitle = subtitle
            promo.image_url = image_url
            promo.save()
            promo.products.set(sample(products, min(18, len(products))))

    def create_reviews(self, products, buyers):
        if Review.objects.exists():
            return
        for product in sample(products, min(120, len(products))):
            for user in sample(buyers, randint(1, min(3, len(buyers)))):
                Review.objects.get_or_create(
                    user=user,
                    product=product,
                    defaults={"rating": randint(4, 5), "text": choice(REVIEW_TEXTS), "is_published": True},
                )

    def create_addresses(self, buyers):
        for user in buyers:
            UserAddress.objects.get_or_create(
                user=user,
                title="Дом",
                defaults={"city": "Москва", "street": "ул. Примерная, 10", "apartment": "42", "is_default": True},
            )


def slugify_ru(value: str) -> str:
    mapping = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
        "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
        "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch",
        "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya", " ": "-", ",": "", ".": "",
    }
    slug = "".join(mapping.get(char, char) for char in value.lower())
    return "-".join(part for part in slug.replace("/", "-").split("-") if part)
