from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .chat import answer_question
from .models import Category, ChatLog, NewsletterSubscriber, Opportunity, Profile
from .serializers import (
    AdminOpportunitySerializer,
    CategorySerializer,
    ChatLogSerializer,
    ChatRequestSerializer,
    NewsletterSerializer,
    OpportunityDetailSerializer,
    OpportunityListSerializer,
    RegisterSerializer,
    UserSerializer,
)


class OpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Opportunity.objects.filter(is_active=True).select_related("category")
    lookup_field = "slug"

    def get_serializer_class(self):
        return OpportunityDetailSerializer if self.action == "retrieve" else OpportunityListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        kind = params.get("kind")
        study = params.get("study_level")
        level = params.get("level")
        funding = params.get("funding")
        featured = params.get("featured")
        q = params.get("q")
        openness = params.get("open")

        if kind:
            qs = qs.filter(kind__in=kind.split(","))
        if study:
            qs = qs.filter(study_level=study)
        if funding:
            qs = qs.filter(funding=funding)
        if featured == "true":
            qs = qs.filter(featured=True)
        if level:
            # JSONField "contains" is not supported on every database backend
            # (notably this SQLite build), so filter in Python. The dataset is
            # small; PostgreSQL users can switch to levels__contains later.
            matching_ids = [
                pk for pk, levels in qs.values_list("pk", "levels") if level in (levels or [])
            ]
            qs = qs.filter(pk__in=matching_ids)
        if q:
            from django.db.models import Q

            qs = qs.filter(
                Q(title__icontains=q) | Q(provider__icontains=q) | Q(summary__icontains=q)
            )
        if openness == "open":
            qs = qs.filter(deadline__gte=timezone.localdate())
        ordering = params.get("ordering")
        if ordering in {"deadline", "-deadline", "title", "-created_at"}:
            qs = qs.order_by(ordering)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Opportunity.objects.filter(pk=instance.pk).update(views=instance.views + 1)
        instance.views += 1
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        result = answer_question(message, request.user if request.user.is_authenticated else None)
        ChatLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            message=message,
            answer=result["answer"],
            intent=result["intent"],
        )
        return Response(result)


class NewsletterView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"email": ["This field is required."]}, status=400)
        obj, created = NewsletterSubscriber.objects.get_or_create(email=email)
        return Response(
            {"email": obj.email, "created": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ToggleSavedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        try:
            op = Opportunity.objects.get(slug=slug)
        except Opportunity.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        profile, _ = Profile.objects.get_or_create(user=request.user)
        if profile.saved.filter(pk=op.pk).exists():
            profile.saved.remove(op)
            saved = False
        else:
            profile.saved.add(op)
            saved = True
        return Response({"saved": saved, "slug": slug})


# ----------------------------- Admin portal -----------------------------


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        return Response(
            {
                "opportunities": Opportunity.objects.count(),
                "active": Opportunity.objects.filter(is_active=True).count(),
                "closing_soon": Opportunity.objects.filter(
                    is_active=True, deadline__gte=today, deadline__lte=today + timedelta(days=30)
                ).count(),
                "users": User.objects.count(),
                "new_users_7d": User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count(),
                "subscribers": NewsletterSubscriber.objects.count(),
                "chats": ChatLog.objects.count(),
                "by_kind": list(Opportunity.objects.values("kind").annotate(count=Count("id"))),
            }
        )


class AdminUsersView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.select_related("profile").order_by("-date_joined")


class AdminOpportunityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Opportunity.objects.select_related("category").all()
    serializer_class = AdminOpportunitySerializer
    lookup_field = "slug"

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup = self.kwargs.get(self.lookup_field)
        obj = get_object_or_404(queryset, slug=lookup)
        self.check_object_permissions(self.request, obj)
        return obj


class AdminChatLogView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ChatLogSerializer

    def get_queryset(self):
        return ChatLog.objects.all()[:100]
