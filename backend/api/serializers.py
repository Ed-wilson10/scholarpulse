from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Category, ChatLog, NewsletterSubscriber, Opportunity, Profile


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "color", "icon", "description"]


class OpportunityListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    days_left = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()

    class Meta:
        model = Opportunity
        fields = [
            "id", "title", "slug", "provider", "kind", "category", "summary",
            "levels", "study_level", "funding", "countries", "host_country",
            "deadline", "days_left", "is_open", "application_url", "image_url",
            "tags", "featured", "verified",
        ]


class OpportunityDetailSerializer(OpportunityListSerializer):
    class Meta(OpportunityListSerializer.Meta):
        fields = OpportunityListSerializer.Meta.fields + [
            "description", "eligibility", "documents", "source_url", "views",
            "created_at", "updated_at",
        ]


class AdminOpportunitySerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", allow_null=True, required=False
    )

    class Meta:
        model = Opportunity
        fields = [
            "id", "title", "slug", "provider", "kind", "category_id", "summary",
            "description", "eligibility", "documents", "levels", "study_level",
            "funding", "countries", "host_country", "deadline", "application_url",
            "source_url", "image_url", "tags", "featured", "is_active", "verified",
            "views", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "views", "created_at", "updated_at"]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["university", "level", "phone", "interests"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    saved = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_staff", "date_joined", "profile", "saved"]

    def get_saved(self, obj):
        return list(obj.profile.saved.values_list("slug", flat=True)) if hasattr(obj, "profile") else []


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=80)
    last_name = serializers.CharField(max_length=80)
    university = serializers.CharField(max_length=160, required=False, allow_blank=True)
    level = serializers.ChoiceField(choices=Profile.LEVEL_CHOICES, required=False)

    def validate_email(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        Profile.objects.create(
            user=user,
            university=validated_data.get("university") or "University of Cape Coast",
            level=validated_data.get("level") or "400",
        )
        return user


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatLog
        fields = ["id", "message", "answer", "intent", "created_at"]


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)
