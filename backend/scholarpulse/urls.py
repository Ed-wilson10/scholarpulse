from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    """Lightweight liveness probe for Docker, previews and uptime checks."""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("health", health),
    path("health/", health),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
