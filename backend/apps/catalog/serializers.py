from rest_framework import serializers
from django.utils.text import slugify

from apps.catalog.models import Brand, Category, Product, ProductAttribute, ProductImage, Promotion


def unique_slug(model, title: str) -> str:
    base = slugify(title, allow_unicode=True) or "item"
    slug = base
    index = 2
    while model.objects.filter(slug=slug).exists():
        slug = f"{base}-{index}"
        index += 1
    return slug


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "title", "slug", "parent", "image", "image_url", "sort_order", "seo_title", "seo_description", "children")
        extra_kwargs = {"slug": {"required": False}}

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True, context=self.context).data

    def create(self, validated_data):
        validated_data.setdefault("slug", unique_slug(Category, validated_data["title"]))
        return super().create(validated_data)


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "title", "slug", "logo", "logo_url", "description", "created_at", "updated_at")
        extra_kwargs = {"slug": {"required": False}}

    def create(self, validated_data):
        validated_data.setdefault("slug", unique_slug(Brand, validated_data["title"]))
        return super().create(validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt", "sort_order")


class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = ("id", "name", "value", "group")


class ProductCardSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "sku",
            "brand",
            "category",
            "price",
            "old_price",
            "stock",
            "rating",
            "reviews_count",
            "is_hit",
            "is_new",
            "image",
            "discount_percent",
            "is_favorite",
        )

    def get_image(self, obj):
        image = obj.images.first()
        if image:
            return image.image.url
        return obj.image_url

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.favorited_by.filter(user=request.user).exists()


class ProductDetailSerializer(ProductCardSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)

    class Meta(ProductCardSerializer.Meta):
        fields = ProductCardSerializer.Meta.fields + ("description", "images", "attributes", "created_at", "updated_at")


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "sku",
            "brand",
            "category",
            "description",
            "image_url",
            "price",
            "old_price",
            "stock",
            "is_hit",
            "is_new",
            "status",
        )
        read_only_fields = ("id", "slug")


class PromotionSerializer(serializers.ModelSerializer):
    products = ProductCardSerializer(many=True, read_only=True)

    class Meta:
        model = Promotion
        fields = "__all__"
