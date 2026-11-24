from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminChatLogView,
    AdminOpportunityViewSet,
    AdminStatsView,
    AdminUsersView,
    CategoryViewSet,
    ChatView,
    MeView,
    NewsletterView,
    OpportunityViewSet,
    RegisterView,
    ToggleSavedView,
)

router = DefaultRouter()
router.register("opportunities", OpportunityViewSet, basename="opportunity")
router.register("categories", CategoryViewSet, basename="category")
router.register("admin/opportunities", AdminOpportunityViewSet, basename="admin-opportunity")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("chat/", ChatView.as_view(), name="chat"),
    path("newsletter/", NewsletterView.as_view(), name="newsletter"),
    path("saved/<slug:slug>/", ToggleSavedView.as_view(), name="saved"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin/chats/", AdminChatLogView.as_view(), name="admin-chats"),
]
