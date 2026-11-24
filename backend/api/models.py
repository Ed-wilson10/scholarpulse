from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True)
    color = models.CharField(max_length=20, default="#2451FF")
    icon = models.CharField(max_length=40, blank=True, default="🎓")
    description = models.CharField(max_length=240, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Opportunity(models.Model):
    KIND_CHOICES = [
        ("scholarship", "Scholarship"),
        ("exchange", "Exchange program"),
        ("tech", "Tech training"),
        ("linkedin", "LinkedIn opportunity"),
        ("internship", "Internship"),
        ("graduate", "Graduate program"),
    ]
    STUDY_LEVEL_CHOICES = [
        ("undergraduate", "Undergraduate"),
        ("masters", "Masters"),
        ("phd", "PhD"),
        ("training", "Training"),
        ("any", "All levels"),
    ]
    FUNDING_CHOICES = [
        ("full", "Fully funded"),
        ("partial", "Partial funding"),
        ("stipend", "Stipend"),
        ("paid", "Paid opportunity"),
        ("free", "Free program"),
    ]

    title = models.CharField(max_length=240)
    slug = models.SlugField(max_length=260, unique=True)
    provider = models.CharField(max_length=160)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default="scholarship")
    category = models.ForeignKey(
        Category, null=True, blank=True, on_delete=models.SET_NULL, related_name="opportunities"
    )
    summary = models.CharField(max_length=320)
    description = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    documents = models.JSONField(default=list, blank=True)
    levels = models.JSONField(default=list, blank=True)  # ["100","200","300","400"]
    study_level = models.CharField(
        max_length=20, choices=STUDY_LEVEL_CHOICES, default="any"
    )
    funding = models.CharField(max_length=20, choices=FUNDING_CHOICES, default="full")
    countries = models.CharField(max_length=200, blank=True, default="Ghana")
    host_country = models.CharField(max_length=120, blank=True)
    deadline = models.DateField(null=True, blank=True)
    application_url = models.URLField(max_length=500, blank=True)
    source_url = models.URLField(max_length=500, blank=True)
    image_url = models.URLField(max_length=600, blank=True)
    tags = models.JSONField(default=list, blank=True)
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["deadline", "-featured", "title"]

    def __str__(self):
        return self.title

    @property
    def days_left(self):
        from django.utils import timezone

        if not self.deadline:
            return None
        return (self.deadline - timezone.localdate()).days

    @property
    def is_open(self):
        return self.deadline is None or self.days_left >= 0

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify

            base = slugify(self.title)[:240] or "opportunity"
            slug = base
            counter = 2
            while type(self).objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Profile(models.Model):
    LEVEL_CHOICES = [(f"{n}00", f"Level {n}00") for n in range(1, 5)]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    university = models.CharField(max_length=160, blank=True, default="University of Cape Coast")
    level = models.CharField(max_length=5, choices=LEVEL_CHOICES, blank=True, default="400")
    phone = models.CharField(max_length=30, blank=True)
    interests = models.JSONField(default=list, blank=True)
    saved = models.ManyToManyField(Opportunity, blank=True, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} profile"


class ChatLog(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField()
    answer = models.TextField()
    intent = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email
