from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import TimeStampedModel


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Покупатель"
        MANAGER = "manager", "Менеджер"
        ADMIN = "admin", "Администратор"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    REQUIRED_FIELDS = ["email"]


class UserAddress(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    title = models.CharField(max_length=80, default="Дом")
    city = models.CharField(max_length=120)
    street = models.CharField(max_length=255)
    apartment = models.CharField(max_length=40, blank=True)
    entrance = models.CharField(max_length=40, blank=True)
    floor = models.CharField(max_length=40, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"{self.city}, {self.street}"


class Favorite(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE, related_name="favorited_by")

    class Meta:
        unique_together = ("user", "product")
