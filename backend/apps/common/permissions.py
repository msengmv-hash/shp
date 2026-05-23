from rest_framework import permissions


class IsManagerOrAdminForWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or getattr(user, "role", "") in {"manager", "admin"}))
