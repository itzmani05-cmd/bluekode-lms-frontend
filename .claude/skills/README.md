# Claude Code Skills

This folder contains reusable Claude Code skills and workflows for React frontend development in the bluekode-lms project.

## What goes here

Skills are reusable workflows that Claude can follow across sessions. They encode repeatable multi-step tasks specific to this project's conventions.

## Suggested skills to add

| File | Purpose |
|---|---|
| `scaffold-feature.md` | Full feature scaffold: API + store + hooks + components + types + schemas |
| `migrate-component.md` | Migrate a legacy component to current standards (typed props, hooks, Tailwind) |
| `audit-accessibility.md` | Review a component tree for ARIA, keyboard nav, and contrast issues |
| `refactor-inline-logic.md` | Extract inline business logic from JSX into hooks or services |
| `add-zod-validation.md` | Add Zod schema + react-hook-form integration to an existing form |
| `optimize-renders.md` | Identify unnecessary re-renders and apply memoization |
| `write-tests.md` | Generate Vitest + RTL tests for a component or hook |

## Format

Each skill is a Markdown file describing the workflow steps Claude should follow. Skills may reference project conventions from `CLAUDE.md`.

## Usage

Reference a skill in your prompt:

```
Follow the scaffold-feature skill to create a new "notifications" feature.
```

See the [Claude Code documentation](https://docs.anthropic.com/claude-code) for the full skill authoring guide.
