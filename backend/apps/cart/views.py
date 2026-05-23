from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.cart.models import Cart, CartItem
from apps.cart.serializers import CartSerializer
from apps.catalog.models import Product


class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def _cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart
        if not request.session.session_key:
            request.session.create()
        cart, _ = Cart.objects.get_or_create(session_key=request.session.session_key, user=None)
        return cart

    def list(self, request):
        cart = self._cart(request)
        return Response(CartSerializer(cart, context={"request": request}).data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        cart = self._cart(request)
        product = Product.objects.get(pk=request.data["product"])
        quantity = max(int(request.data.get("quantity", 1)), 1)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity", "updated_at"])
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def update_item(self, request):
        cart = self._cart(request)
        item = cart.items.get(pk=request.data["item"])
        item.quantity = max(int(request.data.get("quantity", 1)), 1)
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def remove(self, request):
        cart = self._cart(request)
        cart.items.filter(pk=request.data["item"]).delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        cart = self._cart(request)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)
