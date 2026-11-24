# ScholarPulse

A scholarship and student-opportunity hub for university students in Ghana — Levels 100 to 400.
Built with **Next.js 15**, **Django REST Framework**, **PostgreSQL** and a small in-scope
scholarship chatbot called **Pulse**.

> Status: MVP complete and verified locally. Not deployed publicly yet.

## Repository standards

- **CI:** `.github/workflows/ci.yml` runs Django checks/tests and a production frontend build.
- **Contributing:** `CONTRIBUTING.md` covers setup, branches, commits, reviews and definition of done.
- **Architecture:** `docs/ARCHITECTURE.md` explains the system boundaries and data flows.
- **Ownership:** `.github/CODEOWNERS` (update backend/frontend leads when assigned).
- **Templates:** issue forms and pull request template in `.github/`.
- **Dependencies:** Dependabot checks pip, npm and GitHub Actions weekly.
- **Security:** `SECURITY.md` explains private vulnerability reporting and secret handling.

## What is inside

| Area | Details |
| --- | --- |
| Home page | Hero with a high-resolution photo of students laughing, category grid, featured opportunities, provider marquee, chatbot preview |
| Opportunities | Filter by type, level (100–400), study level, funding, search, sort, open-only toggle |
| Detail page | Deadline countdown, document checklist, eligibility, apply link, save button, "Ask Pulse" button |
| Accounts | Email/password registration, JWT login, saved opportunities, personal deadline watchlist |
| Admin portal | Stats, create/edit/delete listings, toggle featured/active/verified, new accounts table, chatbot transcript log |
| Chatbot | Retrieval + intent engine over the live opportunity database. Answers only scholarship questions: types, documents, deadlines, eligibility |
| Database | PostgreSQL in production (`docker-compose.yml`); SQLite fallback for a quick local run |

## 1. Run locally (fastest path — SQLite)

### Backend

```powershell
cd scholarpulse\backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/`.
Django admin: `http://127.0.0.1:8000/admin/`.

Seed creates a demo team account:

```
Email:    admin@scholarpulse.gh
Password: Admin12345!
```

Change that password before deploying anywhere public.

### Frontend

```powershell
cd scholarpulse\frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

If Node is not on your PATH (this machine), use the full path:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

## 2. Run with PostgreSQL (Docker)

```powershell
cd scholarpulse
docker compose up --build
```

That starts Postgres, runs migrations + seed, and serves the frontend at
`http://localhost:3000` and the API at `http://localhost:8000/api/`.

### PostgreSQL without Docker

1. Create a database and user.
2. Copy `backend/.env.example` to `backend/.env` and fill in the `POSTGRES_*` values.
3. Run `python manage.py migrate` and `python manage.py seed`.

When `POSTGRES_DB` is set, Django switches from SQLite to PostgreSQL automatically.

## 3. Chatbot behaviour

`backend/api/chat.py` is a self-contained engine:

- Greetings, thanks, empty input.
- Specific opportunity questions → documents, deadline or eligibility for the best match.
- "Show deadlines" → closest open deadlines with days left.
- "What documents do I need?" → document lists from the nearest matches.
- Lists and recommendations by study level, kind of opportunity and student level.
- Anything off-topic gets a polite refusal and stays inside scholarship scope.

Every message is stored in `ChatLog`, visible in the admin portal. No external API key is
required. `OPENAI_API_KEY` and `OPENAI_MODEL` exist in `.env.example` as placeholders if you
later want to add an LLM polish layer; the app works without them.

## 4. Key API routes

```
GET    /health                              liveness probe -> {"status": "ok"}
GET    /api/opportunities/                 list + filters (?kind=&study_level=&level=&funding=&q=&open=open&ordering=)
GET    /api/opportunities/<slug>/          detail (increments views)
GET    /api/categories/
POST   /api/auth/register/
POST   /api/auth/login/                    {username: email, password} -> access + refresh
GET    /api/auth/me/
POST   /api/chat/                          {message} -> answer, intent, matches, suggestions
POST   /api/newsletter/
POST   /api/saved/<slug>/                  toggle saved (auth)
GET    /api/admin/stats/                   staff only
GET    /api/admin/users/                   staff only
GET    /api/admin/chats/                   staff only
CRUD   /api/admin/opportunities/           staff only
```

## 5. Project structure

```
scholarpulse/
├── backend/
│   ├── scholarpulse/        settings, root urls, wsgi
│   ├── api/
│   │   ├── models.py        Opportunity, Category, Profile, ChatLog, NewsletterSubscriber
│   │   ├── serializers.py   public + admin serializers
│   │   ├── views.py         public API, auth, chatbot, admin portal endpoints
│   │   ├── chat.py          retrieval + intent scholarship assistant
│   │   └── management/commands/seed.py   6 categories + 20 seeded listings
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 home
│   │   ├── opportunities/           listing + detail
│   │   ├── login/ register/         auth pages
│   │   ├── dashboard/               saved + watchlist
│   │   └── admin/                   team portal
│   ├── components/                  Navbar, Footer, cards, explorer, chatbot, forms
│   └── lib/                         API client + types
├── docs/
│   └── ARCHITECTURE.md      system design, request flows, decisions
├── .github/
│   ├── workflows/ci.yml     backend tests + frontend build
│   ├── ISSUE_TEMPLATE/      bug and feature forms
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── dependabot.yml
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
├── .editorconfig
├── .gitattributes
└── docker-compose.yml
```

## 6. Team workflow

This repository uses **GitHub Flow**:

1. `main` is the only permanent branch and must always be deployable.
2. Create a short-lived branch per task, for example:
   - `feat/api-saved-opportunities`
   - `feat/web-opportunity-filters`
   - `fix/chat-daad-matching`
   - `docs/architecture-notes`
3. Open a pull request into `main` using the template.
4. CI must pass and one teammate must approve.
5. Squash merge, then delete the branch.

A folder structure does not create branches. Branches are a workflow decision; with a small
team, short-lived feature branches plus CI and reviews give better version control than a
permanent `develop` branch. Add a `staging` branch only when there is a staging environment.

Full details: `CONTRIBUTING.md`.
System design: `docs/ARCHITECTURE.md`.
Ownership: update `.github/CODEOWNERS` when backend and frontend leads are confirmed.

## 7. Honest notes

- Seed deadlines are realistic placeholders, not scraped live values. Always verify on the
  official provider page. The UI says this in several places on purpose.
- The chatbot answers from the database. If a deadline or document list is wrong in the admin
  portal, the chatbot will repeat it — keep listings current.
- Images are hot-linked from Unsplash for the demo. Replace them with licensed photos before a
  public launch.
- The site collects emails and names. Add a privacy policy and a data-deletion path before launch.
