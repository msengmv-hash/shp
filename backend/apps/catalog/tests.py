from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(title="Диваны", slug="divany")
        self.brand = Brand.objects.create(title="Forma", slug="forma")
        Product.objects.create(
            title="Диван Forma 10",
            slug="divan-forma-10",
            sku="SKU-1",
            brand=self.brand,
            category=self.category,
            description="Компактный диван для гостиной",
            price=Decimal("19990.00"),
            stock=5,
        )

    def test_product_list_returns_products(self):
        response = self.client.get("/api/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Диван Forma 10")

    def test_product_search_filters_by_query(self):
        response = self.client.get("/api/products/", {"q": "гостиной"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
