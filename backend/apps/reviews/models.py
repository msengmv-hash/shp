from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Review(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField()
    text = models.TextField()
    is_published = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ("-created_at",)
