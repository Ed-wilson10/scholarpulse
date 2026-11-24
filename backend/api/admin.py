from django.contrib import admin

from .models import Category, ChatLog, NewsletterSubscriber, Opportunity, Profile


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "provider", "kind", "study_level", "deadline", "featured", "is_active")
    list_filter = ("kind", "study_level", "funding", "featured", "is_active")
    search_fields = ("title", "provider", "summary", "tags")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "university", "level", "created_at")


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ("message", "intent", "created_at")
    search_fields = ("message", "answer")


@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
