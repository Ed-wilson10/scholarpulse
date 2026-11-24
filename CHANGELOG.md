# Changelog

All notable changes to ScholarPulse are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Public deployment and domain.
- Live scholarship data refresh workflow.
- Privacy policy and account deletion.
- Separate admin layout and server-side route protection.
- Role-based staff permissions.

## [0.1.0] - 2026-11-24

### Added

- Next.js 15 frontend with bright student-focused theme.
- Django REST Framework backend with JWT authentication.
- PostgreSQL support through environment variables and Docker Compose; SQLite fallback
  for local development.
- Opportunity listings, filtering by level, kind, funding, study level and open status.
- Opportunity detail pages with deadlines, document checklists, eligibility and apply links.
- Student registration, login, dashboard and saved opportunities.
- Admin portal with statistics, listing CRUD, new account list and chatbot logs.
- Scholarship-only chatbot with document, deadline, eligibility, list and off-topic handling.
- Seed command with six categories, twenty listings and a demo admin account.
- Backend test suite covering API, auth, saved items, admin permissions, newsletter and
  chatbot behaviour.
- Repository standards: contributing guide, code of conduct, security policy, changelog,
  issue and pull request templates, CODEOWNERS, Dependabot and CI.
