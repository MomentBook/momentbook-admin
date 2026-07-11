# CODEX.md — Prompt Templates

Session prompt templates. Global workflow rules: `~/.claude/CLAUDE.md`.
Domain rules: `AGENTS.md`. Onboarding: `onboard` skill via `~/.claude/skills/onboard/`.

## Onboarding Prompt

```
You are starting a Claude Code session for this repository.

This is an onboarding-only turn. Do not edit, stage, commit, install, or start servers.

Load the `onboard` skill and read `AGENTS.md`.
Return a compact Korean brief with path status, loaded docs, product intent summary,
top invariants, out-of-scope patterns, and default verification commands.
```

## Task Prefix

```
<prefix>
Follow CLAUDE.md and AGENTS.md. Inspect first, keep scope narrow.
Delegate parallel read-only work to subagents. Verify with smallest sufficient check.
</prefix>
```

## Task Suffix

```
<suffix>
Honor AGENTS.md contract invariants. Stay scoped to the task.
For code changes: inspect first, smallest root-cause fix.
For risky work: plan first, ask only when behavior/schema/security materially changes.
Run smallest sufficient verification. Report in Korean; English for code, commits, identifiers.
</suffix>
```
