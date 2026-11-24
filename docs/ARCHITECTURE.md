# Architecture

ScholarPulse is a monorepo with a Django API and a Next.js frontend. This document explains
the boundaries, the request flows and the decisions behind the current structure.

## 1. System overview

```
Browser
  |
  | HTTP (HTML, JSON)
  v
Next.js 15 frontend  ----->  Django REST API  ----->  PostgreSQL
  localhost:3000                :8000/api                (production)
                                     |                  SQLite (local)
                                     |
                              Chatbot + admin logic
```

| Layer | Folder | Responsibility |
| --- | --- | --- |
| Presentation | `frontend/` | Pages, layouts, filters, forms, chatbot widget, admin UI |
| Application API | `backend/api/` | Listings, auth, saved items, newsletter, chat, admin endpoints |
| Domain/data | `backend/api/models.py` | Opportunity, Category, Profile, ChatLog, NewsletterSubscriber |
| Project config | `backend/scholarpulse/` | Settings, root URLs, WSGI |
| Infrastructure | root | Docker Compose, README, CI, repository standards |

## 2. Route map

Public:

```
/                       home, category grid, featured listings
/opportunities          search + filters
/opportunities/<slug>   detail, documents, deadline, apply link
/login                  student login
/register               student registration
/dashboard              saved opportunities and deadlines
```

Staff:

```
/admin                  control room (client-gated, staff-only API calls)
```

API:

```
/health                 liveness probe
/api/opportunities/     read-only listing API with filters
/api/auth/              register, login, refresh, me
/api/saved/<slug>/      toggle saved opportunity
/api/newsletter/        email subscription
/api/chat/              scholarship assistant
/api/admin/             stats, users, chats, listing CRUD (staff only)
```

## 3. Authentication and authorization

- Students authenticate with email and password.
- The API issues a JWT access token and refresh token through `djangorestframework-simplejwt`.
- The frontend stores tokens in `localStorage` and sends `Authorization: Bearer <token>`.
- Saved opportunities require an authenticated user.
- Every `/api/admin/` endpoint uses DRF `IsAdminUser`. Data access is enforced by the server,
  not by the browser.
- The `/admin` page checks for a token and calls the stats endpoint; non-staff users get the
  "Staff log in required" screen.
- Django's built-in `/admin/` remains available for developer-level database operations.

Known trade-off: the admin page is shipped from the same app as the public site and is
gated in the browser. Admin data is still protected server-side, but a production hardening
step is to protect the route earlier (middleware or separate admin deployment).

## 4. Main request flows

### Public listing

1. Next.js server component calls `API_INTERNAL_URL` (server) or the browser calls
   `NEXT_PUBLIC_API_URL`.
2. `OpportunityViewSet` filters active listings by query parameters.
3. Serializer adds `days_left` and `is_open`.
4. Frontend renders `OpportunityCard` / `OpportunityExplorer`.

### Student save

1. Student logs in and receives JWT tokens.
2. Save button calls `POST /api/saved/<slug>/` with the token.
3. API adds or removes the opportunity from `Profile.saved`.
4. Dashboard calls `GET /api/auth/me/` to show saved items.

### Admin edit

1. Staff logs in; frontend checks `is_staff`.
2. Admin page calls `/api/admin/stats/`, `/api/admin/users/`, `/api/admin/chats/` and
   `/api/admin/opportunities/`.
3. Create, update and delete operations are permission-checked on every request.
4. Slugs are generated from titles; duplicate slugs get a numeric suffix.

### Chatbot

1. Widget sends `POST /api/chat/` with a message.
2. `backend/api/chat.py` normalises the text and removes stop words.
3. Candidate opportunities are scored with rarity-weighted token matching. Rare names such
   as DAAD outweigh generic words such as "masters" or "scholarship".
4. The engine detects document, deadline, eligibility, list and greeting intents.
5. Off-topic questions receive a polite refusal instead of an answer.
6. Every exchange is stored in `ChatLog` for the admin portal.

The chatbot is rules-based and uses only the local database. No external AI key is needed.
`OPENAI_API_KEY` remains an optional future extension.

## 5. Data model

| Model | Key fields | Notes |
| --- | --- | --- |
| `Category` | name, slug, colour, icon | Home-page categories and filtering |
| `Opportunity` | title, provider, kind, category, summary, description, eligibility, documents, levels, study_level, funding, countries, host_country, deadline, URLs, image_url, tags, featured, verified, is_active, views | Core listing |
| `Profile` | user, university, level, phone, interests, saved | One-to-one student profile |
| `ChatLog` | user (nullable), message, answer, intent | Admin transcript view |
| `NewsletterSubscriber` | email, created_at | Email capture |

`days_left` and `is_open` are computed properties, not stored.

## 6. Frontend structure

```
frontend/
├── app/                 route segments and page layouts
├── components/          reusable UI and client components
├── lib/                 API client, shared types
├── public/              local static assets (if added later)
└── next.config.ts       image domains, tracing root
```

Pages fetch through `lib/api.ts`. Server components use `API_INTERNAL_URL`; browser code uses
`NEXT_PUBLIC_API_URL`.

## 7. Deployment topology

Current local:

```
Next.js :3000  --->  Django :8000  --->  SQLite
```

Docker Compose:

```
Next.js :3000  --->  Django :8000  --->  PostgreSQL :5432
```

Recommended production split:

```
scholarpulse.gh          public frontend
admin.scholarpulse.gh    staff-only admin app (later)
api.scholarpulse.gh      Django API
```

For an MVP, one Next.js app with `/admin` is acceptable. As staff permissions and personal
data grow, move admin to its own subdomain with SSO, audit logging and an IP allowlist.

## 8. Key decisions

- **Monorepo:** one place for API, UI, docs and CI; simple for a small team.
- **Django + DRF:** fast CRUD, built-in admin, strong auth primitives.
- **Next.js App Router:** server components for public pages, client components for filters,
  forms, dashboard and chat.
- **SQLite fallback:** teammates can run the project without installing PostgreSQL.
- **Rules-based chatbot:** predictable, free, no external dependency, easy to keep in scope.
- **Separate public and staff APIs:** admin data is never exposed by public endpoints.

## 9. Known limitations

- Seed deadlines are placeholders and must be verified against official provider pages.
- Admin route protection is client-gated; the API is server-protected.
- No email delivery service is connected yet; newsletter signups are stored only.
- No automated data refresh; listings are maintained through the admin portal or seed.
- No privacy policy or account deletion flow yet.
- Images are hot-linked from Unsplash for the demo.
