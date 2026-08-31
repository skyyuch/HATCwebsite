/**
 * Batch machine-translation for the i18n message catalogues (`src/messages/*`).
 *
 * Source = default locale (`zh-Hant`). For each target locale file it fills
 * MISSING / empty string leaves with a machine-translated draft for the owner to
 * proofread (e.g. after adding new keys to the source but not yet to the other
 * locales). Existing translations are never overwritten unless `--overwrite` is
 * passed. Uses the same provider as the CMS button / content script.
 *
 * Requires a configured engine (`MT_API_KEY`). With no key it exits cleanly
 * without touching any file. This only rewrites UI copy — it never authors facts;
 * numbers / symbols / codes / {placeholder} tokens are preserved by the provider
 * prompt.
 *
 * Usage (env is loaded by the Payload runner):
 *   npm run i18n:translate                        # fill all target locales
 *   npm run i18n:translate -- --to en             # only English
 *   npm run i18n:translate -- --to zh-Hans --to en
 *   npm run i18n:translate -- --only accounts     # only the `accounts` namespace
 *   npm run i18n:translate -- --overwrite         # retranslate everything
 *
 * `--check` mode (no API key required, no file writes): verifies every non-empty
 * source key exists (non-empty) in each target locale, and warns about stale keys
 * present only in a target. Exits non-zero when any key is missing — this is the
 * gate wired into CI / the pre-commit hook (`npm run i18n:check`).
 *   npm run i18n:check
 *   npm run i18n:check -- --only accounts
 */
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {routing, type Locale} from '../src/i18n/routing';
import {getTranslationProvider, isMtConfigured} from '../src/lib/mt/provider';

type Json = string | number | boolean | null | Json[] | {[k: string]: Json};
type Leaf = {path: (string | number)[]; value: string};

const MESSAGES_DIR = path.resolve(process.cwd(), 'src/messages');
const BATCH_SIZE = 50;

function parseArgs(argv: string[]): {
  to: Locale[];
  only?: string;
  overwrite: boolean;
  check: boolean;
} {
  const to: Locale[] = [];
  let only: string | undefined;
  let overwrite = false;
  let check = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--overwrite') overwrite = true;
    else if (arg === '--check') check = true;
    else if (arg === '--to') to.push(argv[++i] as Locale);
    else if (arg.startsWith('--to=')) to.push(arg.slice('--to='.length) as Locale);
    else if (arg === '--only') only = argv[++i];
    else if (arg.startsWith('--only=')) only = arg.slice('--only='.length);
  }
  return {to, only, overwrite, check};
}

function collectLeaves(node: Json, base: (string | number)[], out: Leaf[]): void {
  if (typeof node === 'string') {
    out.push({path: base, value: node});
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectLeaves(v, [...base, i], out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectLeaves(v, [...base, k], out);
  }
}

function getByPath(obj: unknown, keys: (string | number)[]): unknown {
  let cur: unknown = obj;
  for (const key of keys) {
    if (cur == null) return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

function setByPath(obj: Record<string | number, unknown>, keys: (string | number)[], value: unknown): void {
  let cur: Record<string | number, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const next = cur[key];
    if (next == null || typeof next !== 'object') {
      cur[key] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    cur = cur[key] as Record<string | number, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

async function readJson(locale: Locale): Promise<Record<string, unknown>> {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  return JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>;
}

async function writeJson(locale: Locale, data: unknown): Promise<void> {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function checkMode(targets: Locale[], only: string | undefined): Promise<void> {
  const source = routing.defaultLocale as Locale;
  const sourceData = await readJson(source);
  const sourceLeaves: Leaf[] = [];
  collectLeaves(sourceData as Json, [], sourceLeaves);

  const inScope = (leaf: Leaf) => !only || leaf.path[0] === only;
  const required = sourceLeaves.filter((leaf) => leaf.value.trim().length > 0 && inScope(leaf));
  const sourceKeys = new Set(sourceLeaves.map((leaf) => leaf.path.join('.')));

  let missingTotal = 0;

  for (const locale of targets) {
    const targetData = await readJson(locale);

    const missing = required.filter((leaf) => {
      const current = getByPath(targetData, leaf.path);
      return !(typeof current === 'string' && current.trim().length > 0);
    });

    const targetLeaves: Leaf[] = [];
    collectLeaves(targetData as Json, [], targetLeaves);
    const extra = targetLeaves.filter(
      (leaf) =>
        leaf.value.trim().length > 0 &&
        !sourceKeys.has(leaf.path.join('.')) &&
        inScope(leaf)
    );

    if (missing.length === 0 && extra.length === 0) {
      console.log(`\u2713 ${locale}: in sync (${required.length} key(s)).`);
      continue;
    }

    if (missing.length > 0) {
      missingTotal += missing.length;
      console.error(`\u2717 ${locale}: ${missing.length} missing/empty key(s):`);
      for (const leaf of missing.slice(0, 50)) console.error(`    ${leaf.path.join('.')}`);
      if (missing.length > 50) console.error(`    \u2026and ${missing.length - 50} more`);
    }
    if (extra.length > 0) {
      console.warn(`! ${locale}: ${extra.length} extra key(s) not in ${source} (stale?):`);
      for (const leaf of extra.slice(0, 50)) console.warn(`    ${leaf.path.join('.')}`);
      if (extra.length > 50) console.warn(`    \u2026and ${extra.length - 50} more`);
    }
  }

  if (missingTotal > 0) {
    // Write synchronously and force a non-zero exit: the Payload runner resets
    // `process.exitCode`, so we must exit explicitly for CI / the pre-commit gate.
    process.stderr.write(
      `\ni18n check failed: ${missingTotal} missing/empty key(s). ` +
        `Fill them with \`npm run i18n:translate -- --to <locale>\` or add them manually.\n`
    );
    process.exit(1);
  }
  console.log('\ni18n check passed: every source key is present in all target locales.');
}

async function main(): Promise<void> {
  const {to, only, overwrite, check} = parseArgs(process.argv.slice(2));

  const source = routing.defaultLocale as Locale;
  const allTargets = routing.locales.filter((l) => l !== source) as Locale[];
  const targets = (to.length > 0 ? to : allTargets).filter((l) => l !== source);

  if (check) {
    await checkMode(targets, only);
    return;
  }

  if (!isMtConfigured()) {
    console.error(
      'MT_API_KEY is not configured — set it in .env to enable translation. Nothing changed.'
    );
    return;
  }
  const provider = getTranslationProvider();
  if (!provider) {
    console.error('No translation provider available. Nothing changed.');
    return;
  }

  const sourceData = await readJson(source);
  const sourceLeaves: Leaf[] = [];
  collectLeaves(sourceData as Json, [], sourceLeaves);

  const filtered = sourceLeaves.filter(
    (leaf) =>
      leaf.value.trim().length > 0 && (!only || leaf.path[0] === only)
  );

  let totalFilled = 0;

  for (const locale of targets) {
    const targetData = await readJson(locale);

    const pending = filtered.filter((leaf) => {
      const current = getByPath(targetData, leaf.path);
      const hasValue = typeof current === 'string' && current.trim().length > 0;
      return overwrite || !hasValue;
    });

    if (pending.length === 0) {
      console.log(`${locale}: nothing to translate.`);
      continue;
    }

    console.log(`${locale}: translating ${pending.length} string(s)…`);
    let filled = 0;
    for (const group of chunk(pending, BATCH_SIZE)) {
      const translations = await provider.translateBatch(
        group.map((leaf) => leaf.value),
        {sourceLocale: source, targetLocale: locale}
      );
      group.forEach((leaf, i) => {
        const translated = translations[i];
        if (typeof translated === 'string' && translated.trim().length > 0) {
          setByPath(targetData, leaf.path, translated);
          filled++;
        }
      });
    }

    if (filled > 0) {
      await writeJson(locale, targetData);
      console.log(`${locale}: filled ${filled} string(s).`);
      totalFilled += filled;
    }
  }

  console.log(`Message translation done. Filled ${totalFilled} string(s).`);
}

await main();
