from django.db.models import Prefetch
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import decorators, permissions, response, viewsets

from apps.common.permissions import IsManagerOrAdminForWrite
from apps.catalog.filters import ProductFilter
from apps.catalog.models import Brand, Category, Product, ProductImage, Promotion
from apps.catalog.serializers import BrandSerializer, CategorySerializer, ProductCardSerializer, ProductDetailSerializer, ProductWriteSerializer, PromotionSerializer
from apps.catalog.services import storefront_summary


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None
    permission_classes = [IsManagerOrAdminForWrite]

    def get_queryset(self):
        if self.request.query_params.get("all") == "true" and self.request.user.is_authenticated:
            return Category.objects.all().select_related("parent").prefetch_related("children")
        return Category.objects.filter(parent__isnull=True).prefetch_related("children")

    @method_decorator(cache_page(60 * 10))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by("title")
    serializer_class = BrandSerializer
    lookup_field = "slug"
    pagination_class = None
    permission_classes = [IsManagerOrAdminForWrite]


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsManagerOrAdminForWrite]
    filterset_class = ProductFilter
    search_fields = ("title", "description", "sku", "brand__title", "category__title")
    ordering_fields = ("price", "created_at", "rating", "reviews_count")
    lookup_field = "slug"

    def get_queryset(self):
        base = Product.objects.all()
        if not (
            self.request.query_params.get("include") == "all"
            and self.request.user.is_authenticated
            and (self.request.user.is_staff or getattr(self.request.user, "role", "") in {"manager", "admin"})
        ):
            base = base.filter(status=Product.Status.ACTIVE)
        queryset = (
            base
            .select_related("brand", "category")
            .prefetch_related(Prefetch("images", queryset=ProductImage.objects.order_by("sort_order")), "attributes")
        )
        search = self.request.query_params.get("q")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(sku__icontains=search)
                | Q(brand__title__icontains=search)
                | Q(category__title__icontains=search)
            )
        return queryset

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return ProductWriteSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductCardSerializer


class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.filter(is_active=True).prefetch_related("products", "products__images", "products__brand")
    serializer_class = PromotionSerializer
    lookup_field = "slug"


@decorators.api_view(["GET"])
@decorators.permission_classes([permissions.AllowAny])
def storefront_view(request):
    return response.Response(storefront_summary())
