from django.contrib import admin

from apps.catalog.models import Brand, Category, Product, ProductAttribute, ProductImage, Promotion


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    extra = 3


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "sku", "category", "brand", "price", "stock", "status", "is_hit")
    list_filter = ("status", "category", "brand", "is_hit", "is_new")
    search_fields = ("title", "sku", "description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    inlines = [ProductImageInline, ProductAttributeInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "sort_order")
    list_filter = ("parent",)
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("title", "slug")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


admin.site.register(Promotion)
