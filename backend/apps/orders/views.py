from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer, UserAddressSerializer
from apps.users.models import UserAddress


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        include_all = self.request.query_params.get("include") == "all"
        can_manage = self.request.user.is_staff or getattr(self.request.user, "role", "") in {"manager", "admin"}
        if include_all and can_manage:
            return Order.objects.all().prefetch_related("items__product").order_by("-created_at")
        return Order.objects.filter(user=self.request.user).prefetch_related("items__product").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def set_status(self, request, pk=None):
        order = self.get_object()
        next_status = request.data.get("status")
        if next_status not in Order.Status.values:
            return Response({"detail": "Unknown status"}, status=status.HTTP_400_BAD_REQUEST)
        order.status = next_status
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order, context={"request": request}).data)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = UserAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
