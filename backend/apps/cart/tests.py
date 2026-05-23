from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product


class CartApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = Category.objects.create(title="Кровати", slug="krovati")
        brand = Brand.objects.create(title="Nordika", slug="nordika")
        self.product = Product.objects.create(
            title="Кровать Nordika 20",
            slug="krovat-nordika-20",
            sku="SKU-2",
            brand=brand,
            category=category,
            description="Кровать с подъемным механизмом",
            price=Decimal("39990.00"),
            stock=3,
        )

    def test_guest_can_add_product_to_cart(self):
        response = self.client.post("/api/cart/add/", {"product": self.product.id, "quantity": 2}, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["quantity"], 2)
