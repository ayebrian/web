# Code Style Guide
This document defines the architectural and formatting standards for this project. All contributions must follow these guidelines.

If this document does not cover a specific use case, follow standard React development practices, check ESLint, Prettier and .editorconfig rules or discuss the implementation in your PR or Discussions.

## 1. TypeScript Best Practices
1. Use **string union types** instead of `enum`.

## 2. Architecture & React
1. For components utilizing long Tailwind utility classes, always encapsulate
   them using the `cn` utility function.
2. Always use **path aliases** (e.g. `@/components/`) instead of relative paths.
3. Prefer **named exports** over **defaul texports**.
4. Always define component props explicitly via interfaces.

## 3. State Management & Data Fetching
1. Use **React Query (TanStack Query)** for server state (data loading, caching, and mutations).
2. Use **URL query parameters** for shareable UI state (e.g., pagination, filters, tabs).
3. Use **local state (useState)** only for transient, non-shareable UI interactions.

## 4. File Naming Conventions
1. Use kebab-case for all file names (e.g. `ts/js/tsx`).
2. Prefer naming folders with single word where it possible.
3. Prefer **single-word directory names** where possible (e.g.
   `@/components/bars/`)

