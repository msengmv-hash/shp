from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.cart.views import CartViewSet
from apps.catalog.views import BrandViewSet, CategoryViewSet, ProductViewSet, PromotionViewSet, storefront_view
from apps.orders.views import AddressViewSet, OrderViewSet
from apps.reviews.views import ReviewViewSet
from apps.users.views import AdminUserViewSet, FavoriteViewSet, ProfileView, RegisterView

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="categories")
router.register("brands", BrandViewSet, basename="brands")
router.register("products", ProductViewSet, basename="products")
router.register("promotions", PromotionViewSet, basename="promotions")
router.register("cart", CartViewSet, basename="cart")
router.register("orders", OrderViewSet, basename="orders")
router.register("addresses", AddressViewSet, basename="addresses")
router.register("reviews", ReviewViewSet, basename="reviews")
router.register("favorites", FavoriteViewSet, basename="favorites")
router.register("admin-users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/profile/", ProfileView.as_view(), name="profile"),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/storefront/", storefront_view, name="storefront"),
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
