from django.db import models
from django.utils.text import slugify

from apps.common.models import TimeStampedModel


class Category(TimeStampedModel):
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True)
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")
    image = models.ImageField(upload_to="categories/", blank=True)
    image_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=100)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        ordering = ("sort_order", "title")
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.title


class Brand(TimeStampedModel):
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    logo = models.ImageField(upload_to="brands/", blank=True)
    logo_url = models.URLField(blank=True)
    description = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.title


class Product(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Черновик"
        ACTIVE = "active", "Активен"
        ARCHIVED = "archived", "Архив"

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    sku = models.CharField(max_length=80, unique=True)
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    description = models.TextField()
    image_url = models.URLField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    old_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews_count = models.PositiveIntegerField(default=0)
    is_hit = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ("-is_hit", "-created_at")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title

    @property
    def discount_percent(self) -> int:
        if not self.old_price or self.old_price <= self.price:
            return 0
        return round((1 - self.price / self.old_price) * 100)


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ("sort_order", "id")


class ProductAttribute(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="attributes")
    name = models.CharField(max_length=120)
    value = models.CharField(max_length=255)
    group = models.CharField(max_length=120, default="Основные")

    class Meta:
        indexes = [models.Index(fields=["name", "value"])]


class Promotion(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="promotions/", blank=True)
    image_url = models.URLField(blank=True)
    products = models.ManyToManyField(Product, blank=True, related_name="promotions")
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
