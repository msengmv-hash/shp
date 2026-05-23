from django.contrib import admin

from apps.orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("title", "price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "phone", "total", "status", "payment_status", "created_at")
    list_filter = ("status", "payment_status", "created_at")
    search_fields = ("customer_name", "phone", "email")
    inlines = [OrderItemInline]
