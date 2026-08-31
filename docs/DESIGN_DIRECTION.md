# HATC Design Direction

> **2026-08-10 — Figma-led homepage rebuild (owner-approved, SUPERSEDES the
> visual system below for the homepage).** The owner supplied a full Figma design
> (`GGCUJwo9drmEUibcs9mLtq`, frame `hatc-v2-homepage` `4:4`) and decided to rebuild
> the homepage to **100% match it**, updating the design system accordingly. This
> flips several earlier rules FOR THE HOMEPAGE (and the shared design system going
> forward): **gold `#d4af37` is back as the primary accent** (the "brass-gold
> retired" rule is reversed), the homepage is a **dark trading-desk theme** (deep
> `#070a14` / `#111625` with light `#f4f6f9` sections interleaved), typography is
> **Sora** (headings + body) with **Inter** for ticker numbers, and **buttons use
> 6px radius** (not pill). A market-ticker, live-price card, K-line mockup and
> stat numbers are allowed as **clearly-labelled sample/placeholder** data. The
> full spec lives in `docs/FIGMA_HOMEPAGE_SPEC.md` — it is the single implementation
> source for the rebuild. Governance red lines still hold: sample numbers stay out
> of `HATC_FACTS.md`, operational links stay in the CMS, all copy stays in
> `src/messages/*` (three locales), real facts cite `HATC_FACTS.md` only.
>
> **IMPLEMENTED (2026-08-10, 第九輪).** The homepage rebuild is done — see
> `docs/HANDOFF.md` 第九輪. Concretely, the shared design system now includes:
> Sora (body+headings) + Inter (ticker/big numbers) via `next/font` in
> `src/lib/fonts.ts`; `--fig-*` dark/gold tokens in `src/styles/tokens.css`
> (additive; warm-white system untouched); `--color-gold` / `--font-sans` /
> `--font-ticker` bridged in `globals.css` `@theme`; shadcn `button` at **6px
> radius** with a `gold` variant. Homepage sections live in
> `src/components/home/*` (Hero+MarketTicker, TrustStrip, Services, MT5Showcase,
> WhyHATC, Academy, CompanyStory, ClientSupport, FinalCta) with a shared
> `SectionTitle`; sample market data is centralised in
> `src/components/home/sampleMarketData.ts` and always UI-labelled "示意數據".
>
> NOTE (updated 2026-08-10, 第十三輪): The **About page is now also rebuilt to the
> Figma dark/gold system** (frame `12:4`; spec `docs/FIGMA_ABOUT_SPEC.md`), so the
> homepage AND About now share the dark theme end-to-end. Owner decisions this round:
> the development-history timeline uses the REAL FACTS milestones (2025–2026), not
> Figma's placeholder years, and shows no founding year; the client-fund
> custody/segregation statement is owner-confirmed and now an approved fact in
> `HATC_FACTS.md`. The **warm-white / navy / green system remains** only for any
> other non-homepage surfaces that don't yet have their own Figma (the `--fig-*`
> dark tokens are additive, so the warm-white tokens still exist and coexist).
>
> ---
>
> **2026-08-07 — Vantage-informed redesign (historical; homepage now Figma-led).**
> The owner reviewed the earlier
> restrained editorial style and asked to borrow Vantage Markets' **layout,
> motion and information architecture** (product-forward homepage, activity/news
> cards, tabbed product explorer, stat counters, card grids, scroll-reveal,
> pill buttons) while **keeping the HATC navy brand** (no Vantage orange). The
> "must not resemble fintech" restriction is deliberately relaxed for higher
> energy — but the HATC red lines below (facts, business positioning, brand
> colour, no fabricated data) still stand. **Hero is now dark** (owner 2026-08-07,
> for the CFD-led homepage): a deep-navy gradient hero with a subtle grid and a
> green glow, backed by a real reception photo — the earlier "light hero" choice
> is superseded. Dark navy also anchors the closing CTA band and footer; the body
> sections remain warm-white.

## Brand positioning

HATC is a professional Hong Kong precious-metals financial-services brand whose
**headline offering is precious-metals CFD trading** (gold and silver;
owner 2026-08-10: platinum is **not** currently offered), **credibility-backed** by its Hong Kong Gold
Exchange AA membership (member No. 008), participant certificate and physical
gold-exchange products. The exchange membership and certificates are the trust
layer under a CFD-led homepage — not the main headline.

The visual tone must be:

- professional, stable, credible, human
- confident and product-forward, but never hype-driven
- editorial structure with contemporary energy (not a generic template)

## Content emphasis (owner decision, 2026-08-07 — updated)

- **The homepage leads with precious-metals CFD trading** (gold and silver;
  platinum not currently offered — owner 2026-08-10). CFD products / platform /
  trading education are the main act.
- Company facts (Gold Exchange AA membership No. 008, participant certificate,
  physical products, office, milestones) are the **credibility / trust layer**
  that differentiates HATC's CFD offer — supporting, not dominant.
- Homepage order (concept at `/preview`, owner 2026-08-07): Hero (CFD-led, dark)
  → CFD products / markets (precious metals) → Why HATC (condensed credibility:
  008 / AA counters + trust cards) → Platform / how it works → News & activities
  (CMS) → Trading education → Contact CTA.
- **Certificates, Milestones AND the office gallery are NOT on the homepage**
  (owner 2026-08-07) — all company-facts material belongs on the About page,
  keeping the homepage focused on the CFD product. The homepage keeps only a
  condensed credibility band (008 / AA + trust cards) as the CFD differentiator.
- Still owner-supplied only: any CFD trading conditions (leverage, spreads,
  lots, fees, platform). Do not fabricate; see `HATC_FACTS.md` → CFD business.

## Never use

- AI-generated traders or fake office photographs
- Vantage orange or any non-brand accent colour as a system colour
- glowing gold objects, floating 3D coins, full-screen candlestick backgrounds
- glassmorphism
- generic fintech slogans; fabricated award / user-count / testimonial claims
- unverified spreads / leverage / performance figures (gold CFD is an approved
  business line per 2026-08-07 owner decision, but its specific trading
  conditions must be owner-supplied — never invented or copied from competitors)
- unsupported performance claims, fake testimonials or statistics

## Now allowed (previously restricted)

- Pill (999px) radius for buttons, badges and tabs; cards up to 12px.
- Subtle **brand-navy** gradients and soft, brand-tinted shadows (no neon,
  no glow). Green may appear as a small gradient partner only.
- Purposeful motion: number counters, scroll-reveal, hover lift on cards.
- Card grids and a dark navy closing CTA band.

## Brand palette (from the official HATC logo)

- Primary: HATC navy `#09395f` — brand, headings, primary CTAs, links, focus.
- Accent: HATC green `#009944` — sparing only (small rules, timeline dots,
  the logo's triangle). Never large fills or body text.
- Neutrals: warm white background, white surfaces, charcoal ink `#1f1c19`.
- The earlier "brass-gold" direction is retired (2026-08-07) to align with the
  real logo. Tokens live in `src/styles/tokens.css` (`--color-brand`,
  `--color-brand-deep`, `--color-accent`, `--color-accent-deep`).

## Visual system

- Warm white / charcoal / brand navy, with green as a sparing accent
- Light hero on warm white; deep navy reserved for the closing CTA band
- Structured grid with card-based, product-forward sections
- Controlled whitespace; sections use `--section-pad`
- Border radius: 0–12px for surfaces, `--radius-pill` (999px) for controls
- Purposeful motion only: counters, scroll-reveal, hover lift
- Real certificates, office photographs and Hong Kong imagery preferred
- Traditional Chinese is the initial primary language
- Architecture must support Simplified Chinese and English later

Tokens live in `src/styles/tokens.css`: `--color-brand` / `--color-brand-deep`
/ `--color-brand-darker` / `--color-brand-bright`, `--color-accent`,
`--radius-xl`, `--radius-pill`, `--shadow-card`, `--shadow-hero`, `--section-pad`.

## UI implementation / tooling (owner decision, 2026-08-07)

- **Component system = shadcn/ui + Tailwind CSS v4** (owner-approved "方向 A").
  You own the component source under `src/components/ui/*`; theme it with the
  **HATC navy brand** — never Vantage orange. All prior visual rules (dark hero,
  facts governance, no fabricated data, design graphics over AI photos) still hold.
- Map the brand into shadcn's CSS variables via the `@theme` block in
  `src/styles/globals.css`: `--primary` = navy `#09395f`, `--accent` = green
  `#009944` (sparing), warm-white background, `--radius` 12px, pill for controls.
- **Single source of colour = `src/styles/tokens.css`** (consolidated 2026-08-07,
  第七輪). `globals.css`'s `@theme` holds **no hex** — it only bridges tokens into
  shadcn's semantic colour namespace with `var(--token)`. Name-clash resolved:
  shadcn muted **surface** = `--color-muted-surface`; muted **text** grey renamed
  to `--color-ink-muted` (do not reuse `--color-muted` for text).
- **Rollout complete (2026-08-07, 第七輪)**: every homepage section (Hero, Markets,
  WhyHATC, Process, Activities, Academy, ContactBand) and the About sections
  (AboutIntro, Milestones, Certificates, Office) are now Tailwind + shadcn; their
  `*.module.css` files are deleted. The **isolated pilot has been removed**
  (`src/app/(pilot)`, `src/styles/pilot.css`, the proxy `ui-pilot` exception).
  Tailwind coexists with the remaining global/utility CSS Modules (Header, Footer,
  LocaleSwitcher, ComingSoon) because CSS Modules are unlayered and win the cascade.
