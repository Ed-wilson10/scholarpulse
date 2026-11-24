# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report privately to **edseyjr@gmail.com** with:

- what the issue is;
- steps to reproduce;
- affected page or endpoint;
- any suggested fix.

You will get an acknowledgement as soon as possible. Please give the team time to fix the
issue before discussing it publicly.

## Supported versions

Only the current `main` branch is supported during active development.

## Secrets and credentials

- Never commit `.env`, `.env.local`, tokens, private keys or database dumps.
- The demo admin account created by `python manage.py seed` is for local development only.
  Change the password before deploying anywhere public.
- Production must set its own `DJANGO_SECRET_KEY`, disable `DJANGO_DEBUG`, restrict
  `DJANGO_ALLOWED_HOSTS` and configure PostgreSQL credentials through environment
  variables.
- If a secret is exposed, rotate it immediately and remove it from git history.

## Scope

This project handles student names, email addresses and saved opportunities. Treat all
personal data as private. Do not add analytics, advertising pixels or third-party trackers
without discussion and a privacy policy update.
