# Bluekode LMS

A LMS built as a **monorepo** - meaning multiple apps (API and Web) live in a single repository and share a common setup.

## Structure

```
bluekode-lms/
|__ package.json          <-- Root (manages both packages)
|__ packages/
|   |__ api/              <-- Backend  - NestJS
|   |__ web/              <-- Frontend - React + Vite
```

The root `package.json` uses [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) to link everything together. 
This means **never need to `cd` into a package folder** - all commands are run from the root.

## Prerequisites

- Node.js >= 22 (LTS)
- npm >= 11

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This single command installs dependencies for **both** `api` and `web`. npm workspaces handles this automatically.

### 2. Start development servers

```bash
npm run dev
```

This starts both the API (NestJS) and Web (Vite) dev servers at the same time.

## Available Scripts

All commands are run from the **root** of the project:

| Command         | What it does                                      |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Starts both API and Web dev servers concurrently   |
| `npm run build` | Builds both API and Web for production             |
| `npm run lint`  | Lints both API and Web                             |
| `npm run start` | Starts both API and Web in production mode         |

## Working with Individual Packages

Sometimes only want to run a command for one package from root. Use the `-w` flag (short for `--workspace`):

```bash
# Run dev server for only the API
npm run dev -w packages/api

# Run dev server for only the Web
npm run dev -w packages/web

# Lint only the API
npm run lint -w packages/api
```

## Installing Dependencies

To add a new npm package from root, must specify **which package** it belongs to using `-w`:

```bash
# Add a package to the API
npm install axios -w packages/api

# Add a dev dependency to the Web
npm install -D tailwindcss -w packages/web
```

> **Why not just `npm install <pkg>`**? In a monorepo, npm needs to know which package should get the dependency. 
> Without `-w`, it would install to the root, which is not what you want.

## Tech Stack

| Package | Framework        | Port |
| ------- | ---------------- |------|
| `api`   | NestJS           | 8000 |
| `web`   | React + Vite     | 5173 |