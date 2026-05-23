from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "Новый"
        PAID = "paid", "Оплачен"
        ASSEMBLING = "assembling", "Комплектуется"
        SHIPPED = "shipped", "В доставке"
        DONE = "done", "Завершен"
        CANCELED = "canceled", "Отменен"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Ожидает"
        PAID = "paid", "Оплачен"
        FAILED = "failed", "Ошибка"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    customer_name = models.CharField(max_length=160)
    phone = models.CharField(max_length=32)
    email = models.EmailField()
    city = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    comment = models.TextField(blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.PROTECT)
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def total(self):
        return self.price * self.quantity
