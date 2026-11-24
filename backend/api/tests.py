from datetime import date, timedelta

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from .chat import answer_question
from .models import Category, Opportunity


class ScholarshipApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name="Masters", slug="masters")
        cls.open_op = Opportunity.objects.create(
            title="Test Masters Scholarship",
            slug="test-masters-scholarship",
            provider="Test Foundation",
            kind="scholarship",
            category=cls.category,
            summary="A fully funded masters scholarship for Ghanaian students.",
            description="Test description",
            eligibility="Ghanaian graduates with a first degree.",
            documents=["Transcript", "Passport", "Motivation letter"],
            levels=["400"],
            study_level="masters",
            funding="full",
            countries="Ghana",
            deadline=date.today() + timedelta(days=20),
            application_url="https://example.com/apply",
            tags=["masters", "ghana"],
            featured=True,
        )
        cls.closed_op = Opportunity.objects.create(
            title="Closed Exchange Program",
            slug="closed-exchange-program",
            provider="Test Exchange",
            kind="exchange",
            summary="An exchange that already closed.",
            levels=["200"],
            study_level="undergraduate",
            funding="full",
            deadline=date.today() - timedelta(days=3),
            is_active=True,
        )
        cls.hidden_op = Opportunity.objects.create(
            title="Hidden Scholarship",
            slug="hidden-scholarship",
            provider="Hidden Provider",
            kind="scholarship",
            summary="Should not appear in public listings.",
            levels=["100"],
            study_level="undergraduate",
            funding="partial",
            deadline=date.today() + timedelta(days=10),
            is_active=False,
        )

        cls.student = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="Student12345!",
            first_name="Ama",
            last_name="Mensah",
        )
        cls.staff = User.objects.create_superuser(
            username="staff@example.com",
            email="staff@example.com",
            password="Staff12345!",
        )

    def test_public_list_hides_inactive_and_filters_kind(self):
        res = self.client.get("/api/opportunities/?kind=scholarship")
        self.assertEqual(res.status_code, 200)
        payload = res.json()
        results = payload["results"] if isinstance(payload, dict) else payload
        slugs = {item["slug"] for item in results}
        self.assertIn("test-masters-scholarship", slugs)
        self.assertNotIn("hidden-scholarship", slugs)

    def test_detail_increments_views(self):
        res = self.client.get("/api/opportunities/test-masters-scholarship/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["title"], "Test Masters Scholarship")
        self.open_op.refresh_from_db()
        self.assertEqual(self.open_op.views, 1)

    def test_level_filter(self):
        res = self.client.get("/api/opportunities/?level=400")
        payload = res.json()
        results = payload["results"] if isinstance(payload, dict) else payload
        self.assertEqual([item["slug"] for item in results], ["test-masters-scholarship"])

    def test_register_and_login(self):
        res = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@example.com",
                "password": "NewStudent123!",
                "first_name": "Kofi",
                "last_name": "Boateng",
                "university": "University of Ghana",
                "level": "200",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.content)
        self.assertTrue(User.objects.filter(username="new@example.com").exists())

        login = self.client.post(
            "/api/auth/login/",
            {"username": "new@example.com", "password": "NewStudent123!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access", login.json())

    def test_saved_toggle_requires_auth(self):
        url = "/api/saved/test-masters-scholarship/"
        self.assertEqual(self.client.post(url).status_code, 401)

        self.client.force_authenticate(self.student)
        first = self.client.post(url)
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.json()["saved"])
        second = self.client.post(url)
        self.assertFalse(second.json()["saved"])

    def test_admin_endpoints_are_staff_only(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get("/api/admin/stats/").status_code, 403)

        self.client.force_authenticate(self.staff)
        res = self.client.get("/api/admin/stats/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["opportunities"], 3)

    def test_admin_can_create_opportunity(self):
        self.client.force_authenticate(self.staff)
        res = self.client.post(
            "/api/admin/opportunities/",
            {
                "title": "New Admin Scholarship",
                "provider": "Admin Provider",
                "kind": "scholarship",
                "summary": "Created through the admin portal.",
                "levels": ["300", "400"],
                "study_level": "undergraduate",
                "funding": "full",
                "countries": "Ghana",
                "deadline": str(date.today() + timedelta(days=30)),
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.content)
        self.assertTrue(Opportunity.objects.filter(slug="new-admin-scholarship").exists())

    def test_chat_documents_and_deadline(self):
        result = answer_question("What documents do I need for the Test Masters Scholarship?")
        self.assertEqual(result["intent"], "opportunity_detail")
        self.assertIn("Transcript", result["answer"])
        self.assertTrue(result["matches"])

        deadline = answer_question("When is the deadline for Test Masters Scholarship?")
        self.assertIn("20 days", deadline["answer"])

    def test_chat_greeting_and_out_of_scope(self):
        greeting = answer_question("hello")
        self.assertEqual(greeting["intent"], "greeting")

        off_topic = answer_question("Who won the football match yesterday?")
        self.assertEqual(off_topic["intent"], "out_of_scope")

    def test_chat_specific_name_beats_generic_words(self):
        Opportunity.objects.create(
            title="DAAD EPOS Postgraduate Courses",
            slug="daad-test",
            provider="DAAD Germany",
            kind="scholarship",
            summary="Masters courses in Germany for developing countries.",
            documents=["CV", "Motivation letter"],
            levels=["400"],
            study_level="masters",
            funding="full",
            deadline=date.today() + timedelta(days=60),
            tags=["germany", "masters"],
        )
        Opportunity.objects.create(
            title="Generic Masters Scholarship",
            slug="generic-masters",
            provider="Some Foundation",
            kind="scholarship",
            summary="A masters scholarship for students.",
            levels=["400"],
            study_level="masters",
            funding="full",
            deadline=date.today() + timedelta(days=45),
            tags=["masters", "scholarship"],
        )
        result = answer_question("What documents do I need for a DAAD masters scholarship?")
        self.assertEqual(result["intent"], "opportunity_detail")
        self.assertIn("DAAD", result["answer"])
        self.assertNotIn("Generic Masters", result["answer"])

    def test_chat_masters_list_excludes_closed(self):
        result = answer_question("Show me masters scholarships")
        self.assertEqual(result["intent"], "list")
        slugs = [m["slug"] for m in result["matches"]]
        self.assertIn("test-masters-scholarship", slugs)
        self.assertNotIn("closed-exchange-program", slugs)

    def test_newsletter_endpoint(self):
        res = self.client.post("/api/newsletter/", {"email": "ama@example.com"}, format="json")
        self.assertEqual(res.status_code, 201)
        again = self.client.post("/api/newsletter/", {"email": "ama@example.com"}, format="json")
        self.assertEqual(again.status_code, 200)
