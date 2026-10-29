# THIRD_PARTY.md: Open-source libraries used in MINDTRACE

Indie track rule: everything presented was built from scratch Oct 27–Nov 4, 2026.
This file lists third-party open-source packages used, with versions and licences.
Application code itself is original; only the packages below are third-party.

## Runtime and framework (to be pinned at scaffold)

| Package | Version | Licence | Purpose |
|---|---|---|---|
| next | 14.2.35 | MIT | App Router framework + API routes (patched for Dec 2025 security update) |
| react | 18.3.1 | MIT | UI |
| react-dom | 18.3.1 | MIT | UI rendering |
| zod | 3.23.8 | MIT | Shared client/server validation |
| @supabase/supabase-js | 2.43.4 | MIT | Postgres + Auth client |
| typescript | 5.4.5 | Apache-2.0 | Type-check |
| tailwindcss | 3.4.3 | MIT | Styling with DESIGN.md tokens |
| postcss | 8.4.38 | MIT | CSS pipeline |
| autoprefixer | 10.4.19 | MIT | CSS vendor prefixes |
| vitest | 2.0.5 | MIT | Unit tests |
| eslint | 8.57.0 | MIT | Lint |
| eslint-config-next | 14.2.35 | MIT | Next lint rules |
| @types/node | 20.12.12 | MIT | Types |
| @types/react | 18.3.3 | MIT | Types |
| @types/react-dom | 18.3.0 | MIT | Types |

## Notes

- No application code, data, or assets from earlier projects are used.
- Pin exact versions here when dependencies are added.
- Meta models are services, not packages; they are documented in README and `docs/META_API_NOTES.md`, not here.
