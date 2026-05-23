from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product


class FavoriteApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username="buyer", email="buyer@example.test", password="password123")
        category = Category.objects.create(title="Шкафы", slug="shkafy")
        brand = Brand.objects.create(title="HomeLine", slug="homeline")
        self.product = Product.objects.create(
            title="Шкаф HomeLine 30",
            slug="shkaf-homeline-30",
            sku="SKU-3",
            brand=brand,
            category=category,
            description="Шкаф для спальни",
            price=Decimal("29990.00"),
            stock=8,
        )

    def test_authenticated_user_can_toggle_favorite(self):
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/favorites/toggle/", {"product": self.product.id}, format="json")
        self.assertEqual(response.status_code, 201)

        response = self.client.post("/api/favorites/toggle/", {"product": self.product.id}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_favorite"])
