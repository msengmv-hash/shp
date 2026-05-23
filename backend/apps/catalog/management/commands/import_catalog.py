import csv
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from apps.catalog.models import Brand, Category, Product, ProductAttribute
from apps.catalog.management.commands.seed_demo import slugify_ru


class Command(BaseCommand):
    help = "Import real catalog data from CSV. Existing SKUs are updated."

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)

    def handle(self, *args, **options):
        path = Path(options["csv_path"])
        if not path.exists():
            raise CommandError(f"CSV file not found: {path}")

        required = {"sku", "title", "category", "brand", "price", "stock"}
        created = 0
        updated = 0

        with path.open("r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            missing = required - set(reader.fieldnames or [])
            if missing:
                raise CommandError(f"Missing required columns: {', '.join(sorted(missing))}")

            for row in reader:
                brand, _ = Brand.objects.get_or_create(
                    title=row["brand"].strip(),
                    defaults={"slug": slugify_ru(row["brand"].strip())},
                )
                category, _ = Category.objects.get_or_create(
                    title=row["category"].strip(),
                    defaults={"slug": slugify_ru(row["category"].strip())},
                )
                product, was_created = Product.objects.update_or_create(
                    sku=row["sku"].strip(),
                    defaults={
                        "title": row["title"].strip(),
                        "slug": row.get("slug") or slugify_ru(f"{row['title']} {row['sku']}"),
                        "brand": brand,
                        "category": category,
                        "description": row.get("description") or row["title"].strip(),
                        "image_url": row.get("image_url", "").strip(),
                        "price": Decimal(row["price"]),
                        "old_price": Decimal(row["old_price"]) if row.get("old_price") else None,
                        "stock": int(row.get("stock") or 0),
                        "is_hit": row.get("is_hit", "").lower() in {"1", "true", "yes", "да"},
                        "is_new": row.get("is_new", "").lower() in {"1", "true", "yes", "да"},
                        "status": Product.Status.ACTIVE,
                    },
                )
                self.import_attributes(product, row)
                created += int(was_created)
                updated += int(not was_created)

        self.stdout.write(self.style.SUCCESS(f"Catalog import finished: {created} created, {updated} updated."))

    def import_attributes(self, product, row):
        for name, key in {
            "Ширина": "width",
            "Глубина": "depth",
            "Высота": "height",
            "Материал": "material",
            "Цвет": "color",
        }.items():
            value = row.get(key)
            if value:
                ProductAttribute.objects.update_or_create(product=product, name=name, defaults={"value": value})
