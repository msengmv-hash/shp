from django.db import transaction
from rest_framework import serializers

from apps.cart.models import Cart
from apps.orders.models import Order, OrderItem
from apps.orders.services import notify_order_created
from apps.users.serializers import AddressSerializer
from apps.users.models import UserAddress


class OrderItemSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "title", "price", "quantity", "total")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("user", "status", "payment_status", "total")

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart = Cart.objects.filter(user=user).prefetch_related("items__product").first()
        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Корзина пуста")
        order = Order.objects.create(user=user, **validated_data)
        total = 0
        for cart_item in cart.items.all():
            product = cart_item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                title=product.title,
                price=product.price,
                quantity=cart_item.quantity,
            )
            total += product.price * cart_item.quantity
        order.total = total
        order.payment_status = Order.PaymentStatus.PAID
        order.status = Order.Status.PAID
        order.save(update_fields=["total", "payment_status", "status"])
        cart.items.all().delete()
        notify_order_created(order)
        return order


class UserAddressSerializer(AddressSerializer):
    class Meta(AddressSerializer.Meta):
        model = UserAddress
