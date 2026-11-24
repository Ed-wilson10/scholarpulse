"""Scholarship assistant.

A small retrieval + intent engine that answers questions about scholarship
types, required documents, deadlines and eligibility using the live database.
No external API is required; an optional OpenAI polish can be enabled later.
"""
from __future__ import annotations

import math
import re
from datetime import date
from typing import Any

from django.utils import timezone

from .models import Opportunity

STOPWORDS = {
    "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "at", "is",
    "are", "do", "does", "i", "me", "my", "you", "your", "what", "which",
    "when", "how", "can", "could", "please", "tell", "about", "with", "any",
    "give", "show", "list", "need", "needed", "required", "requirements",
    "there", "this", "that", "it", "be", "by", "from", "as", "am", "was",
}

DOMAIN_WORDS = {
    "scholarship", "scholarships", "scholar", "opportunity", "opportunities",
    "deadline", "deadlines", "due", "document", "documents", "apply",
    "application", "masters", "master", "undergraduate", "undergrad", "phd",
    "exchange", "internship", "internships", "graduate", "training", "study",
    "funding", "funded", "university", "student", "students", "level",
    "chevening", "daad", "erasmus", "mastercard", "fulbright", "commonwealth",
    "gnpc", "mtn", "amalitech", "aws", "alx", "google", "linkedin", "mandela",
    "ugrad", "scholars", "tuition", "stipend", "eligibility", "eligible",
    "programme", "program", "africa", "ghana",
}

GREETINGS = {"hi", "hello", "hey", "good morning", "good afternoon", "good evening", "yo"}
THANKS = {"thanks", "thank you", "thank u", "appreciate", "cheers"}


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def _tokens(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", _norm(text)) if t not in STOPWORDS and len(t) > 2]


def _fmt_date(value: date | None) -> str:
    if not value:
        return "Rolling / not stated"
    return value.strftime("%d %b %Y")


def _deadline_sentence(op: Opportunity) -> str:
    if not op.deadline:
        return "This one has no fixed deadline, so treat it as rolling and apply early."
    days = (op.deadline - timezone.localdate()).days
    if days < 0:
        return f"The deadline was {_fmt_date(op.deadline)} and has passed. Check the official page for the next cycle."
    if days == 0:
        return f"The deadline is today, {_fmt_date(op.deadline)}."
    return f"The deadline is {_fmt_date(op.deadline)}, which is {days} day{'s' if days != 1 else ''} from today."


def _documents_block(op: Opportunity) -> str:
    docs = op.documents or []
    if not docs:
        return "No specific document list is published yet. Check the official application page."
    return "\n".join(f"• {d}" for d in docs)


def _token_hit(haystack: str, token: str) -> bool:
    """Match plural/singular forms without a stemmer."""
    if token in haystack:
        return True
    if len(token) > 4 and token.endswith("s") and token[:-1] in haystack:
        return True
    return False


def _token_weights(all_ops: list[Opportunity], tokens: list[str]) -> dict[str, float]:
    """Rare words matter more. "DAAD" should beat "masters scholarship"."""
    total = max(len(all_ops), 1)
    weights: dict[str, float] = {}
    for token in set(tokens):
        df = sum(
            1
            for op in all_ops
            if _token_hit(_norm(" ".join([op.title, op.provider, " ".join(op.tags or [])])), token)
        )
        weights[token] = 1 + math.log((total + 1) / (df + 1))
    return weights


def _score(op: Opportunity, tokens: list[str], raw: str, weights: dict[str, float]) -> float:
    haystack_title = _norm(op.title)
    haystack_provider = _norm(op.provider)
    haystack_tags = _norm(" ".join(op.tags or []))
    haystack_summary = _norm(op.summary)
    haystack_kind = _norm(op.kind.replace("_", " "))
    haystack_level = _norm(op.study_level)
    score = 0.0
    for token in tokens:
        weight = weights.get(token, 1.0)
        if _token_hit(haystack_title, token):
            score += 6 * weight
        if _token_hit(haystack_provider, token):
            score += 6 * weight
        if _token_hit(haystack_tags, token):
            score += 3 * weight
        if _token_hit(haystack_kind, token) or _token_hit(haystack_level, token):
            score += 1.5 * weight
        if _token_hit(haystack_summary, token):
            score += 1 * weight
    # multi-word provider/name match gets a strong boost
    for phrase in [haystack_title, haystack_provider]:
        if phrase and phrase in raw:
            score += 8
    return score


def _match_levels(tokens: list[str]) -> list[str]:
    found = []
    for t in tokens:
        if t in {"100", "200", "300", "400"} and t not in found:
            found.append(t)
    return found


def _match_study(tokens: list[str], raw: str) -> str | None:
    if any(t in tokens for t in {"masters", "master", "msc", "mba"}):
        return "masters"
    if any(t in tokens for t in {"undergraduate", "undergrad", "bachelor", "bsc"}):
        return "undergraduate"
    if "phd" in tokens or "doctorate" in tokens:
        return "phd"
    if any(t in tokens for t in {"training", "bootcamp", "tech"}):
        return "training"
    return None


def _match_kind(tokens: list[str], raw: str) -> str | None:
    if "exchange" in tokens:
        return "exchange"
    if any(t in tokens for t in {"internship", "internships"}):
        return "internship"
    if any(t in tokens for t in {"linkedin", "job", "jobs", "graduate"}):
        return "linkedin"
    if any(t in tokens for t in {"training", "aws", "amalitech", "alx", "bootcamp"}):
        return "tech"
    if any(t in tokens for t in {"scholarship", "scholarships", "funding", "funded"}):
        return "scholarship"
    return None


def _card(op: Opportunity) -> dict[str, Any]:
    return {
        "title": op.title,
        "slug": op.slug,
        "provider": op.provider,
        "kind": op.kind,
        "deadline": op.deadline.isoformat() if op.deadline else None,
        "deadline_label": _fmt_date(op.deadline),
        "days_left": op.days_left,
        "study_level": op.study_level,
        "url": op.application_url or op.source_url,
    }


def answer_question(message: str, user=None) -> dict[str, Any]:
    raw = _norm(message)
    tokens = _tokens(message)

    if not raw:
        return _response(
            "Ask me anything about scholarships, documents, deadlines or eligibility.",
            "empty",
        )

    if raw in GREETINGS or any(raw.startswith(g + " ") for g in GREETINGS):
        return _response(
            "Hello! I'm the ScholarPulse assistant. I can help you with scholarship "
            "types, the documents you need, deadlines and eligibility. "
            "Try: \"What masters scholarships are open?\" or \"What documents do I need for DAAD?\"",
            "greeting",
            suggestions=[
                "What scholarships are open for masters?",
                "What documents do I need?",
                "Show me upcoming deadlines",
                "Any opportunities for level 300 students?",
            ],        )

    if any(t in THANKS or raw.startswith("thank") for t in tokens) or raw in THANKS:
        return _response(
            "You're welcome. Keep going — and always double-check the official page before you apply.",
            "thanks",
        )

    qs = Opportunity.objects.filter(is_active=True).select_related("category")
    all_ops = list(qs)

    wants_docs = any(t in tokens for t in {"document", "documents", "requirements", "requirement"}) or (
        "what do i need" in raw or "what is needed" in raw
    )
    wants_deadline = any(t in tokens for t in {"deadline", "deadlines", "due", "closing", "close", "date"}) or (
        "when is" in raw or "when does" in raw or "how long" in raw
    )
    wants_eligibility = any(t in tokens for t in {"eligibility", "eligible", "qualify", "qualification", "who can"})
    wants_list = any(
        t in tokens
        for t in {"scholarship", "scholarships", "opportunity", "opportunities", "show", "list", "recommend", "available", "open"}
    )

    # Rank by relevance.
    weights = _token_weights(all_ops, tokens)
    scored = sorted(
        ((_score(op, tokens, raw, weights), op) for op in all_ops),
        key=lambda pair: (pair[0], -(pair[1].days_left if pair[1].days_left is not None else 9999)),
        reverse=True,
    )
    best_score, best = scored[0] if scored else (0, None)

    level_filter = _match_levels(tokens)
    study_filter = _match_study(tokens, raw)
    kind_filter = _match_kind(tokens, raw)

    def filtered():
        items = all_ops
        if study_filter:
            items = [o for o in items if o.study_level == study_filter or study_filter in (o.tags or [])]
        if kind_filter:
            items = [o for o in items if o.kind == kind_filter or kind_filter in (o.tags or [])]
        if level_filter:
            items = [o for o in items if any(lv in (o.levels or []) for lv in level_filter)]
        return [o for o in items if o.is_open]

    # Specific opportunity question (documents / deadline / eligibility)
    if best and best_score >= 6 and (wants_docs or wants_deadline or wants_eligibility):
        if wants_docs:
            answer = (
                f"For **{best.title}** ({best.provider}), here are the documents usually requested:\n\n"
                f"{_documents_block(best)}\n\n"
                f"{_deadline_sentence(best)} Always confirm on the official page before submitting."
            )
        elif wants_deadline:
            answer = (
                f"**{best.title}** — {_deadline_sentence(best)}\n\n"
                f"Study level: {best.get_study_level_display()}. "
                f"Application page: {best.application_url or 'see the official page'}"
            )
        else:
            answer = (
                f"**{best.title}** ({best.provider})\n\n"
                f"Eligibility:\n{best.eligibility or 'See the official page for full eligibility.'}\n\n"
                f"{_deadline_sentence(best)}"
            )
        return _response(answer, "opportunity_detail", [best], suggestions=_suggestions_for(best))

    # Deadline overview
    if wants_deadline and not wants_docs:
        upcoming = [o for o in all_ops if o.is_open and o.deadline]
        upcoming.sort(key=lambda o: o.deadline)
        upcoming = upcoming[:6]
        if upcoming:
            lines = "\n".join(
                f"• **{o.title}** — {_fmt_date(o.deadline)} "
                f"({(o.deadline - timezone.localdate()).days} days left)"
                for o in upcoming
            )
            return _response(
                "Here are the closest deadlines in the database right now:\n\n" + lines +
                "\n\nAlways verify on the official page; dates can change.",
                "deadlines",
                upcoming,
                suggestions=["What documents do I need?", "Show masters scholarships", "Any exchange programs?"],
            )
        return _response("There are no fixed deadlines listed at the moment. Check the opportunities page for rolling programs.", "deadlines")

    # Documents overview
    if wants_docs and not (best and best_score >= 6):
        target = filtered()[:3] or all_ops[:3]
        if target:
            parts = []
            for op in target:
                parts.append(f"**{op.title}**\n{_documents_block(op)}")
            return _response(
                "Most applications ask for a similar core set: academic transcripts, "
                "a valid ID or passport, a motivation letter, and reference letters. "
                "Here is what the closest matches require:\n\n" + "\n\n".join(parts) +
                "\n\nRequirements vary by provider, so confirm on the official page.",
                "documents",
                target,
                suggestions=["Show upcoming deadlines", "What masters scholarships are open?"],
            )

    # Lists / recommendations
    if wants_list or study_filter or kind_filter or level_filter:
        items = filtered()
        if items:
            items.sort(key=lambda o: (o.deadline is None, o.deadline or date.max))
            items = items[:6]
            intro_bits = []
            if study_filter:
                intro_bits.append(study_filter)
            if kind_filter:
                intro_bits.append(kind_filter.replace("_", " "))
            if level_filter:
                intro_bits.append("level " + ", ".join(level_filter))
            intro = "Here are " + (" / ".join(intro_bits) + " " if intro_bits else "") + "opportunities that match:"
            lines = "\n".join(
                f"• **{o.title}** ({o.provider}) — {o.get_study_level_display()}, "
                f"deadline: {_fmt_date(o.deadline)}"
                for o in items
            )
            return _response(
                intro + "\n\n" + lines + "\n\nTap any opportunity on the site for the full checklist.",
                "list",
                items,
                suggestions=["What documents do I need?", "Show upcoming deadlines", "Any fully funded options?"],
            )

    # Unrelated question -> stay in scope
    if not (set(tokens) & DOMAIN_WORDS) and best_score < 4:
        return _response(
            "I'm only able to help with scholarships and student opportunities — "
            "things like scholarship types, required documents, deadlines and eligibility. "
            "Ask me one of those and I'll dig through the database for you.",
            "out_of_scope",
            suggestions=[
                "What scholarships are open for masters?",
                "What documents do I need for DAAD?",
                "Show upcoming deadlines",
            ],
        )

    # Generic helpful fallback with nearest matches
    nearest = [o for o in all_ops if o.is_open][:4]
    if nearest:
        lines = "\n".join(f"• **{o.title}** — {_fmt_date(o.deadline)}" for o in nearest)
        return _response(
            "I can help with scholarship types, documents, deadlines and eligibility. "
            "Here are a few opportunities that may interest you:\n\n" + lines,
            "fallback",
            nearest,
            suggestions=["What documents do I need?", "Show masters scholarships", "Any tech training programs?"],
        )

    return _response(
        "I couldn't find a match in the database yet. Try asking about a scholarship name, "
        "a study level (masters, undergraduate), documents, or deadlines.",
        "no_match",
    )


def _suggestions_for(op: Opportunity) -> list[str]:
    return [
        f"What documents do I need for {op.title}?",
        "Show upcoming deadlines",
        "Any other opportunities like this?",
    ]


def _response(answer: str, intent: str, matches=None, suggestions=None) -> dict[str, Any]:
    return {
        "answer": answer,
        "intent": intent,
        "matches": [_card(o) for o in (matches or [])],
        "suggestions": suggestions or [
            "What scholarships are open for masters?",
            "What documents do I need?",
            "Show upcoming deadlines",
        ],
    }
