from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.users.models import Favorite, User, UserAddress


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "phone", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_active")


admin.site.register(UserAddress)
admin.site.register(Favorite)
