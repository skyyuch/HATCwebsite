# HATC Website Agent Instructions

Before planning, designing or changing code, read:

1. `docs/HATC_PROJECT_BRIEF.md`
2. `docs/HATC_FACTS.md`
3. `docs/WEBSITE_STRUCTURE.md`
4. `docs/DESIGN_DIRECTION.md`

## Working rules

- Do not invent company facts, licences, membership information,
  statistics, products, testimonials or trading conditions.
- Treat `docs/HATC_FACTS.md` as the only approved source of company facts.
- If information is missing or contradictory, ask before implementing it.
- Do not rewrite approved Chinese copy unless requested.
- Plan and complete one page at a time.
- Check desktop, tablet and mobile layouts.
- Before making major visual changes, explain the reason.
- The website must feel institutional, restrained and credible.
- It must not resemble a crypto, AI, gambling or template fintech website.

## Solution quality

- Proposals and implementations must be thorough. Do not take shortcuts that hit the
  immediate goal while creating downstream problems (tech debt, i18n gaps, a11y/SEO,
  performance, maintainability, scalability).
- Solve root causes, not symptoms. Call out trade-offs, edge cases and follow-up work
  explicitly instead of hiding them.
- No temporary hacks or dead ends presented as complete. If a proper fix is out of
  scope, say so and record it for review.

## Meta rules

- Keep the Cursor rules and these docs up to date. Whenever a decision, convention
  or fact changes, update `.cursor/rules/*.mdc` and the relevant `docs/*` file in the
  same change, and briefly note what was updated.
- Hand off before context gets too long. When a task grows large or context is heavy,
 split it (new task / subagent / fresh session) to protect output quality, and pass
 a concise summary of decisions and current state.
- On every hand off, in addition to updating `docs/HANDOFF.md`, ALWAYS output a
 ready-to-paste kickoff prompt for the next agent directly in the chat (self-contained:
 required reading, owner-decided decisions, red lines, current state, next steps, open
 questions). Never leave it only in the docs — always give it to the user.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
