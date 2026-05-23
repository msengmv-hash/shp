from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.models import Favorite
from django.contrib.auth import get_user_model

from apps.users.serializers import AdminUserSerializer, FavoriteSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related("product", "product__brand")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        product_id = request.data.get("product")
        favorite = Favorite.objects.filter(user=request.user, product_id=product_id).first()
        if favorite:
            favorite.delete()
            return Response({"is_favorite": False})
        created = Favorite.objects.create(user=request.user, product_id=product_id)
        return Response(FavoriteSerializer(created, context={"request": request}).data, status=status.HTTP_201_CREATED)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all().order_by("-is_superuser", "-is_staff", "username")
    search_fields = ("username", "email", "phone", "first_name", "last_name")
    ordering_fields = ("username", "email", "role", "is_staff", "is_active")
