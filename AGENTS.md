# AGENTS.md

This file provides guidance for AI agents working in this repository.

## Project Overview

- **Type**: Personal portfolio website
- **Framework**: Astro 5.x with React 18, Svelte 5, and Tailwind CSS v4
- **Runtime**: Node 24.x (uses ES modules with `"type": "module"`)
- **Hosting**: Vercel (server-side rendering)

## Commands

### Development

```bash
npm run dev       # Start development server
npm run start     # Alias for astro dev
npm run preview   # Preview production build locally
```

### Building

```bash
npm run build     # Generate AI context + build for production
npm run astro     # Run Astro CLI commands
```

### Code Generation

```bash
npm run generate:ai-context   # Generate context JSON for AI assistant
```

**Note**: `predev` and `prestart` automatically run the AI context generation script.

### Formatting

```bash
npx prettier --write .   # Format all files
npx prettier --check .   # Check formatting without writing
```

This project uses Prettier with the `prettier-plugin-astro` plugin. Configuration is in `.prettierrc.cjs`.

### Linting/Type Checking

```bash
npx astro check   # Run TypeScript type checking
```

**Note**: There are no ESLint or unit tests configured. The project relies on Prettier for formatting and `astro check` for type safety.

## Code Style Guidelines

### General

- Use ES modules (`import`/`export`) - the project uses `"type": "module"` in package.json
- Use strict TypeScript (extends `astro/tsconfigs/strict`)
- Prefer functional components and hooks over classes
- Avoid `any` types - use `unknown` when type is uncertain, then narrow

### TypeScript

- **Interfaces over types** for object shapes (e.g., `interface Project {...}`)
- **Type aliases** for unions, tuples, and primitives
- Use `type` for utility types like `Record<K, V>`, `Partial<T>`, etc.
- Always type function parameters and return values
- Use `strict` mode enabled in tsconfig.json

### Imports

**Order:**

1. External libraries (React, Astro, etc.)
2. Internal utilities/functions
3. Components (relative paths)
4. Styles/assets

**Example:**

```typescript
import { useState, useEffect } from "react";
import type { APIRoute } from "astro";
import { fetchData } from "../../utils/data";
import Nav from "../components/react/Nav";
import styles from "./Component.module.css";
```

- Use absolute paths for internal modules (e.g., `src/utils/`)
- Use explicit file extensions in imports (`.tsx`, `.ts`, `.astro`)
- Use `import type` for type-only imports

### Naming Conventions

- **Components**: PascalCase (e.g., `PortfolioAssistant.tsx`, `Card.astro`)
- **Files/utilities**: camelCase (e.g., `github.ts`, `blogs.ts`)
- **Interfaces**: PascalCase with descriptive names (e.g., `NowPlayingTrack`)
- **Constants**: UPPER_SNAKE_CASE for compile-time constants (e.g., `DEFAULT_SUGGESTIONS`)
- **Variables/functions**: camelCase
- **Boolean variables**: Use `is`, `has`, `can` prefixes (e.g., `isLoading`, `hasError`)

### React/Component Patterns

- Use functional components with hooks
- Destructure props in function signature when possible
- Use `useEffect` cleanup functions for event listeners and subscriptions
- Use `client:load` or `client:visible` directives for interactive React components in Astro
- Handle loading/error states explicitly

**Example:**

```typescript
export default function Component({ title }: { title: string }) {
  const [state, setState] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const data = await loadData();
      if (isMounted) setState(data);
    }
    void fetchData();
    return () => { isMounted = false; };
  }, []);

  return <div>{state}</div>;
}
```

### Error Handling

- Use try/catch blocks for async operations
- Let errors propagate with meaningful messages in utility functions
- Log errors to console with descriptive messages
- Use Sentry for production error tracking (imported from `@sentry/astro`)
- Return early on error conditions

**Example:**

```typescript
async function fetchData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch failed", error);
    throw error;
  }
}
```

### Astro Components

- Frontmatter at top with `---` fences
- Put imports and logic in frontmatter
- Template in HTML-like syntax below frontmatter
- Use `client:*` directives only when needed for interactivity

### Tailwind CSS

- Use Tailwind v4 with `@tailwindcss/vite` plugin
- Dark mode via `dark` class on `html` element
- Use semantic class names where possible
- Use `dark:` prefix for dark mode variants

### State Management

- Use **nanostores** (`nanostores` package) for global state (see `src/store.js`)
- Use React `useState` for component-local state
- Use `useEffect` for side effects

### API Routes

- Use Astro's `APIRoute` type for endpoint functions
- Return `Response` objects with appropriate headers
- Validate request bodies before processing
- Handle CORS with origin checking for production APIs

### File Organization

```
src/
├── components/       # Astro and React components
│   └── react/       # React-specific components
├── data/            # Static data (portfolio info, config)
├── icons/           # Icon assets
├── layouts/         # Astro layouts
├── pages/           # Astro pages and API routes
│   └── api/        # Server-side API endpoints
├── store.js        # Global nanostore state
├── styles/         # Global CSS
└── utils/          # Utility functions
```

### Git/Version Control

- Keep `.env` files local - never commit secrets
- Use conventional commit messages if contributing
- The `.gitignore` excludes `dist/`, `node_modules/`, `.env`

### Environment Variables

Required variables (check `.env` for defaults):

- `GITHUB_USERNAME`, `GITHUB_ACCESS_TOKEN` - GitHub API
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` - Error tracking
- `AI_GATEWAY_API_KEY` - AI chat functionality
- `ANILIST_USERNAME` - Anime data
- `LASTFM_API_KEY`, `LASTFM_USERNAME` - Music data

### Additional Notes

- The project generates `generated/ai-context.json` at build time for the AI assistant
- Run `npm run generate:ai-context` after adding new content (projects, blog posts, etc.)
- The AI chat endpoint (`/api/chat`) uses rate limiting via Vercel Firewall
- Pre-commit hooks are not configured - rely on manual Prettier usage
