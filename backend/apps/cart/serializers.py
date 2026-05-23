from rest_framework import serializers

from apps.cart.models import Cart, CartItem
from apps.catalog.serializers import ProductCardSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductCardSerializer(source="product", read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_detail", "quantity", "total")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "updated_at")
