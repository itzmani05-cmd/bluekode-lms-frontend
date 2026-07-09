# Claude Code Commands

This folder contains reusable Claude Code slash commands for the bluekode-lms frontend project.

## What goes here

Each file in this directory becomes a `/command-name` slash command available inside Claude Code sessions for this project.

## File format

Create a Markdown file named after the command (e.g., `new-feature.md`). Claude will execute the instructions in the file when you type `/new-feature` in a session.

## Suggested commands to add

| File | Purpose |
|---|---|
| `new-feature.md` | Scaffold a new feature slice under `src/features/` |
| `new-component.md` | Generate a typed, accessible React component |
| `new-hook.md` | Generate a custom hook with proper typing |
| `new-store.md` | Generate a Zustand slice for a feature |
| `new-schema.md` | Generate a Zod schema and matching TypeScript type |
| `new-api.md` | Generate a typed Axios API module |
| `review-component.md` | Review a component for accessibility, types, and performance |

## Usage

```
/new-component ComponentName
/new-feature featureName
```

See the [Claude Code documentation](https://docs.anthropic.com/claude-code) for the full command authoring guide.
