from django.db.models import Count, Max, Min

from apps.catalog.models import Brand, Category, Product, Promotion


def storefront_summary() -> dict:
    prices = Product.objects.filter(status=Product.Status.ACTIVE).aggregate(min_price=Min("price"), max_price=Max("price"))
    return {
        "products": Product.objects.filter(status=Product.Status.ACTIVE).count(),
        "categories": Category.objects.count(),
        "brands": Brand.objects.count(),
        "promotions": Promotion.objects.filter(is_active=True).count(),
        "min_price": prices["min_price"],
        "max_price": prices["max_price"],
        "top_categories": list(
            Category.objects.filter(products__isnull=False)
            .annotate(products_count=Count("products"))
            .order_by("-products_count")
            .values("title", "slug", "products_count")[:10]
        ),
    }
