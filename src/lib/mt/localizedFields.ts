/**
 * Localized-field traversal for machine translation.
 *
 * Walks a Payload field config (collection or global) together with a document
 * and collects translatable localized leaves, including nested `group` / `row` /
 * `collapsible` / named-or-unnamed `tabs` / `array` / `blocks` structures.
 *
 * Two kinds of leaves are collected:
 * - **text / textarea** localized leaves → `collectLeaves` (string values).
 * - **richText (Lexical)** localized leaves → `collectRichTextLeaves` (Lexical
 *   JSON values; the text nodes inside are translated by `richText.ts`).
 *
 * Deliberately NOT translated (so codes / symbols / facts stay intact):
 * - non-localized fields (symbols, codes, panel labels, slugs, numbers…)
 * - `select`, `checkbox`, `number`, `date`, `relationship`, `upload`
 * - any field flagged `admin.custom.mtSkip === true`
 *
 * Kept dependency-free (pure logic) so `payload.config.ts` can import the
 * detector without pulling server-only modules.
 */
import type {Field} from 'payload';

export type Leaf = {
  /** Path of keys / array indices from the document root to the value. */
  path: (string | number)[];
  /** Current string value at that path (may be empty). */
  value: string;
};

export type RichLeaf = {
  /** Path of keys / array indices from the document root to the richText value. */
  path: (string | number)[];
  /** Current Lexical JSON value at that path (may be empty / null). */
  value: unknown;
};

type Data = Record<string, unknown> | null | undefined;

function isSkipped(field: Field): boolean {
  const custom = (field.admin as {custom?: {mtSkip?: boolean}} | undefined)?.custom;
  return custom?.mtSkip === true;
}

/** Localized text / textarea leaf (translated as a plain string). */
function isTextLeaf(field: Field): boolean {
  return (
    (field.type === 'text' || field.type === 'textarea') &&
    field.localized === true &&
    !isSkipped(field)
  );
}

/** Localized richText leaf (Lexical; text nodes translated by `richText.ts`). */
function isRichLeaf(field: Field): boolean {
  return field.type === 'richText' && field.localized === true && !isSkipped(field);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/**
 * Generic container walk. Invokes `onLeaf(field, value, path)` for every named
 * leaf-capable field (its value read from the matching data record). Container
 * fields (`group` / `row` / `collapsible` / `tabs` / `array` / `blocks`) are
 * recursed with the appropriate data slice and path.
 */
function walkFields(
  fields: Field[],
  data: Data,
  basePath: (string | number)[],
  onLeaf: (field: Field, value: unknown, path: (string | number)[]) => void
): void {
  const record = asRecord(data) ?? {};

  for (const field of fields) {
    if (isSkipped(field)) continue;

    switch (field.type) {
      case 'group': {
        if ('name' in field && field.name) {
          walkFields(field.fields, asRecord(record[field.name]), [...basePath, field.name], onLeaf);
        } else {
          // Unnamed (presentational) group: fields live at the same data level.
          walkFields(field.fields, record, basePath, onLeaf);
        }
        break;
      }
      case 'row':
      case 'collapsible': {
        // Presentational containers: their fields live at the same data level.
        walkFields(field.fields, record, basePath, onLeaf);
        break;
      }
      case 'tabs': {
        for (const tab of field.tabs) {
          if ('name' in tab && tab.name) {
            walkFields(tab.fields, asRecord(record[tab.name]), [...basePath, tab.name], onLeaf);
          } else {
            walkFields(tab.fields, record, basePath, onLeaf);
          }
        }
        break;
      }
      case 'array': {
        const rows = record[field.name];
        if (Array.isArray(rows)) {
          rows.forEach((row, i) => {
            walkFields(field.fields, asRecord(row), [...basePath, field.name, i], onLeaf);
          });
        }
        break;
      }
      case 'blocks': {
        const rows = record[field.name];
        if (Array.isArray(rows)) {
          rows.forEach((row, i) => {
            const r = asRecord(row);
            const block = field.blocks.find((b) => b.slug === r?.blockType);
            if (block) {
              walkFields(block.fields, r, [...basePath, field.name, i], onLeaf);
            }
          });
        }
        break;
      }
      default: {
        const name = (field as {name?: string}).name;
        if (name) onLeaf(field, record[name], [...basePath, name]);
        break;
      }
    }
  }
}

/**
 * Collect localized text / textarea leaves from `fields` against `data`.
 * `basePath` is the path accumulated by parent containers.
 */
export function collectLeaves(
  fields: Field[],
  data: Data,
  basePath: (string | number)[] = []
): Leaf[] {
  const out: Leaf[] = [];
  walkFields(fields, data, basePath, (field, value, path) => {
    if (isTextLeaf(field)) {
      out.push({path, value: typeof value === 'string' ? value : ''});
    }
  });
  return out;
}

/**
 * Collect localized richText (Lexical) leaves from `fields` against `data`. The
 * value is the raw Lexical JSON; translate its text nodes with `richText.ts`.
 */
export function collectRichTextLeaves(
  fields: Field[],
  data: Data,
  basePath: (string | number)[] = []
): RichLeaf[] {
  const out: RichLeaf[] = [];
  walkFields(fields, data, basePath, (field, value, path) => {
    if (isRichLeaf(field)) {
      out.push({path, value});
    }
  });
  return out;
}

/** Read a nested value by path. */
export function getByPath(
  obj: Record<string, unknown>,
  path: (string | number)[]
): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

/** Set a nested value by path, creating intermediate objects as needed. */
export function setByPath(
  obj: Record<string, unknown>,
  path: (string | number)[],
  value: unknown
): void {
  let cur: Record<string | number, unknown> = obj as Record<string | number, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = cur[key];
    if (next == null || typeof next !== 'object') {
      cur[key] = typeof path[i + 1] === 'number' ? [] : {};
    }
    cur = cur[key] as Record<string | number, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

/**
 * True when a field config contains at least one translatable localized leaf
 * (text / textarea / richText, recursively). Used to decide which collections /
 * globals get the one-click translate control.
 */
export function configHasLocalizedText(fields: Field[]): boolean {
  for (const field of fields) {
    if (isSkipped(field)) continue;
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (isTextLeaf(field)) return true;
        break;
      case 'richText':
        if (isRichLeaf(field)) return true;
        break;
      case 'group':
      case 'row':
      case 'collapsible':
        if (configHasLocalizedText(field.fields)) return true;
        break;
      case 'tabs':
        for (const tab of field.tabs) {
          if (configHasLocalizedText(tab.fields)) return true;
        }
        break;
      case 'array':
        if (configHasLocalizedText(field.fields)) return true;
        break;
      case 'blocks':
        for (const block of field.blocks) {
          if (configHasLocalizedText(block.fields)) return true;
        }
        break;
      default:
        break;
    }
  }
  return false;
}
