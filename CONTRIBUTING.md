# ScholarPulse Contributor Guide

Thanks for working on ScholarPulse. This repository is a monorepo:

- `backend/` - Django REST Framework API, database models, chatbot engine and tests.
- `frontend/` - Next.js 15 App Router application.
- `docs/` - architecture and operating notes.
- `.github/` - CI, issue and pull request templates, ownership.

Read `docs/ARCHITECTURE.md` before making cross-cutting changes.

## 1. Prerequisites

- Python 3.12 or newer (3.13 recommended; 3.14 works locally).
- Node.js 22 LTS or newer, with npm.
- Git.
- Optional: Docker Desktop, for the PostgreSQL stack.

## 2. Local setup

### Backend (SQLite, fastest)

```powershell
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`
Health: `http://127.0.0.1:8000/health`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

### PostgreSQL (Docker)

```powershell
docker compose up --build
```

## 3. Branching model

We use **GitHub Flow**, not Git Flow. `main` is the only permanent branch and must always
be deployable. Branches are a workflow decision, not part of the folder structure.

- Never commit directly to `main`.
- Create one short-lived branch per task.
- Open a pull request into `main`.
- Delete the branch after it is merged.

Branch names:

```
feat/api-saved-opportunities
feat/web-opportunity-filters
feat/admin-user-table
fix/chat-daad-matching
fix/web-mobile-navbar
chore/update-dependencies
docs/architecture-notes
refactor/api-serializers
```

Use these area names after the type: `api`, `web`, `admin`, `db`, `chat`, `ci`, `docs`.

Why not a permanent `develop` branch? With a small team it adds merge overhead without
adding safety. If we later need a staging environment, add a `staging` branch then. Until
then, `main` plus short-lived feature branches and CI is the professional default.

## 4. Commit messages

Use Conventional Commits:

```
feat(api): add saved opportunity endpoint
fix(chat): weight rare scholarship names higher
docs(readme): document local PostgreSQL setup
chore(ci): add frontend build job
```

Rules:

- imperative mood: "add", not "added";
- one logical change per commit;
- reference the issue in the PR, not the commit title;
- never commit secrets, database files, `node_modules`, or `.next`.

## 5. Pull requests

Every change to `main` goes through a pull request.

- Keep PRs small and focused on one purpose.
- Fill in `.github/PULL_REQUEST_TEMPLATE.md`.
- Link the issue it closes.
- CI must pass before merge.
- At least one teammate must review and approve.
- Use **squash merge** so `main` stays readable.
- The author merges after approval and deletes the branch.

Do not force-push shared branches. Do not rewrite `main`.

## 6. Code standards

### Backend

- Follow Django and DRF conventions.
- Commit every migration.
- Add or update tests for API, auth, admin and chatbot changes.
- Keep business logic out of views where practical.
- No hard-coded secrets. Use environment variables.

### Frontend

- TypeScript only; no `any` unless justified.
- Use the App Router and existing layout patterns.
- Put reusable UI in `components/`.
- Call the API through `lib/api.ts`, not with ad-hoc fetches.
- Keep pages accessible: labelled inputs, button text, focus states.
- Run `npm run build` before opening a frontend PR.

### Both

- Do not commit `.env`, `.env.local`, `db.sqlite3`, `node_modules` or `.next`.
- Do not hot-link production assets you do not have rights to use.
- Update documentation when behaviour or setup changes.

## 7. Tests and checks

```powershell
# Backend
cd backend
python manage.py check
python manage.py test api -v 2

# Frontend
cd frontend
npm run build
```

CI runs both jobs on every pull request. A red CI is never merged.

## 8. Ownership

`.github/CODEOWNERS` contains the default owner. When backend and frontend leads are
confirmed, update it:

```
/backend/  @backend-lead
/frontend/ @frontend-lead
/.github/  @Ed-wilson10
```

Owners are automatically requested for review on matching pull requests.

## 9. Definition of done

A task is done when:

- the feature works locally;
- tests are added or updated;
- `python manage.py test api` passes;
- `npm run build` passes;
- documentation is updated;
- no secrets or generated files are committed;
- a teammate has reviewed the pull request.
