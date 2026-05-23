from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from rest_framework import serializers

from apps.catalog.serializers import ProductCardSerializer
from apps.users.models import Favorite, UserAddress

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "role", "is_staff", "is_superuser", "is_active")
        read_only_fields = ("role", "is_staff", "is_superuser", "is_active")


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_staff",
            "is_superuser",
            "is_active",
            "password",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password", None) or get_random_string(12)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = "__all__"
        read_only_fields = ("user",)


class FavoriteSerializer(serializers.ModelSerializer):
    product_detail = ProductCardSerializer(source="product", read_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "product", "product_detail", "created_at")
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs["product"]
        if Favorite.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("Товар уже в избранном")
        return attrs
