from django.db.models import Avg, Count
from rest_framework import permissions, viewsets

from apps.catalog.models import Product
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ("product",)

    def get_queryset(self):
        return Review.objects.filter(is_published=True).select_related("user", "product")

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        aggregate = Review.objects.filter(product=review.product, is_published=True).aggregate(avg=Avg("rating"), count=Count("id"))
        Product.objects.filter(pk=review.product_id).update(rating=aggregate["avg"] or 0, reviews_count=aggregate["count"])
