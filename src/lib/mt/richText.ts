/**
 * Lexical richText text-node helpers for machine translation (Phase 2 + Phase 3).
 *
 * A Payload `richText` value is a Lexical JSON document: `{root: {children: […]}}`.
 * Only `type: 'text'` nodes carry translatable copy; every other node (headings,
 * lists, links, quotes, uploads, line breaks…) is structural and is preserved
 * verbatim. Links and other inline containers nest their text nodes in
 * `children`, so a depth-first walk over `root` + `children` reaches them.
 *
 * The extract / apply walks visit text nodes in the same deterministic DFS order,
 * so translating the extracted strings and re-applying them to a clone of the
 * SAME source document maps each translation back to its node exactly.
 *
 * Phase 3 (per-segment cross-locale fill): when a target locale already holds a
 * partially-filled body we only fill the segments (text nodes) that are still
 * empty, leaving the owner's proofread segments untouched. This is only safe when
 * the source and target share the SAME structure, so `richTextStructure` produces
 * a structural signature (a DFS of node types) that must match before per-segment
 * filling is attempted; otherwise the caller falls back to skipping the field to
 * avoid corrupting a diverged, hand-edited target.
 *
 * Governance: this only rewrites the text of localized editorial articles into a
 * proofreading draft. Numbers / symbols / codes inside the text are preserved by
 * the provider prompt (see `provider.ts`); node formatting (bold, links, …) is
 * kept intact because only the `text` string is replaced.
 *
 * Kept dependency-free (pure logic) so it can be imported anywhere in the config
 * graph without server-only modules.
 */

type LexNode = Record<string, unknown>;

/** Depth-first visit of every Lexical `text` node with a string `text`. */
function forEachTextNode(node: unknown, fn: (n: LexNode) => void): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) forEachTextNode(child, fn);
    return;
  }
  const rec = node as LexNode;
  if (rec.type === 'text' && typeof rec.text === 'string') {
    fn(rec);
    return;
  }
  if (rec.root !== undefined) forEachTextNode(rec.root, fn);
  if (Array.isArray(rec.children)) forEachTextNode(rec.children, fn);
}

/** All text-node strings in DFS order (empty strings included, to keep order). */
export function extractRichTextTexts(body: unknown): string[] {
  const out: string[] = [];
  forEachTextNode(body, (n) => out.push(n.text as string));
  return out;
}

/** True when a richText value has no non-whitespace text (null / empty doc). */
export function isRichTextEmpty(body: unknown): boolean {
  if (!body || typeof body !== 'object') return true;
  return extractRichTextTexts(body).every((t) => t.trim().length === 0);
}

/**
 * Deep-clone `body` and replace each text node's `text` with `texts[i]` in the
 * same DFS order. Empty replacements are skipped (keeps the original text so the
 * structure is preserved). Returns the new body and the count of non-empty
 * replacements applied.
 */
export function applyRichTextTexts(
  body: unknown,
  texts: string[]
): {body: unknown; filled: number} {
  const clone = structuredClone(body);
  let i = 0;
  let filled = 0;
  forEachTextNode(clone, (n) => {
    const t = texts[i++];
    if (typeof t === 'string' && t.length > 0) {
      n.text = t;
      if (t.trim().length > 0) filled++;
    }
  });
  return {body: clone, filled};
}

/**
 * Structural signature of a Lexical body: a DFS of node types (text nodes are
 * collapsed to a single `t` slot). Two bodies with the same signature have the
 * SAME structure AND the same text-node DFS sequence, so a text node at DFS
 * index `i` in one maps exactly to the node at index `i` in the other. Used to
 * gate Phase 3 per-segment filling (only fill when source and target align).
 *
 * The traversal mirrors `forEachTextNode` exactly (early-return on text nodes,
 * recurse into `root` then `children`) so the signature and the extract/apply
 * text-node order stay in lock-step.
 */
export function richTextStructure(body: unknown): string {
  const parts: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    const rec = node as LexNode;
    if (rec.type === 'text' && typeof rec.text === 'string') {
      parts.push('t');
      return;
    }
    const type =
      typeof rec.type === 'string' ? rec.type : rec.root !== undefined ? 'doc' : 'node';
    parts.push(`${type}{`);
    if (rec.root !== undefined) walk(rec.root);
    if (Array.isArray(rec.children)) walk(rec.children);
    parts.push('}');
  };
  walk(body);
  return parts.join(',');
}

/**
 * Deep-clone `body` and replace only the text nodes whose DFS index is a key in
 * `indexToText`, using the mapped translation (blank / whitespace-only
 * translations are skipped so nothing is wiped). All other text nodes and the
 * whole structure are preserved verbatim. Returns the new body and the count of
 * non-empty replacements applied. Pair with `richTextStructure` to guarantee the
 * indices line up with the source they came from.
 */
export function applyRichTextTextsAtIndices(
  body: unknown,
  indexToText: Map<number, string>
): {body: unknown; filled: number} {
  const clone = structuredClone(body);
  let i = 0;
  let filled = 0;
  forEachTextNode(clone, (n) => {
    const idx = i++;
    if (!indexToText.has(idx)) return;
    const t = indexToText.get(idx);
    if (typeof t === 'string' && t.trim().length > 0) {
      n.text = t;
      filled++;
    }
  });
  return {body: clone, filled};
}
