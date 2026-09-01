/**
 * Machine-translation provider abstraction.
 *
 * The CMS "one-click machine translation" pre-fill (route B) uses a provider to
 * translate approved source copy (default locale `zh-Hant`) into the other
 * content locales as **editable drafts** for the owner to proofread. The engine
 * is pluggable and configured entirely through server-only env vars — the API
 * key MUST NOT be exposed to the browser (never `NEXT_PUBLIC_`).
 *
 * Default engine = an OpenAI-compatible chat-completions LLM (Node built-in
 * `fetch`, no extra dependency). A DeepL adapter is provided behind the same
 * interface and can be selected with `MT_PROVIDER=deepl`.
 *
 * Governance red lines honoured here:
 * - Sample numbers, symbols, codes, prices and ratios are preserved verbatim by
 *   the prompt — the machine output is a proofreading draft, never fact.
 * - Facts stay in `docs/HATC_FACTS.md`; approved trading conditions stay in
 *   `src/components/products/tradingConditions.ts`. Translation only rewrites
 *   editorial copy, it never authors facts.
 *
 * Env vars (all server-only):
 *   MT_PROVIDER   `llm` (default) | `deepl`
 *   MT_API_KEY    provider API key (required to enable translation)
 *   MT_BASE_URL   LLM base URL (default https://api.openai.com/v1)
 *   MT_MODEL      LLM model (default gpt-4o-mini)
 *   MT_DEEPL_URL  DeepL API base (default https://api-free.deepl.com/v2)
 *
 * NOTE: imported into the Payload config graph (custom endpoint), so this module
 * must stay resolvable by the Payload CLI — do NOT add `import 'server-only'`.
 * It is only ever imported from server code (endpoint, script, server component).
 */
import type {Locale} from '@/i18n/routing';
import {glossaryFor, glossaryPrompt, type GlossaryEntry} from '@/lib/mt/glossary';

export type TranslateOptions = {
  sourceLocale: Locale;
  targetLocale: Locale;
};

export interface TranslationProvider {
  readonly id: string;
  /**
   * Translate a batch of plain-text strings, preserving order and array length.
   * Empty inputs must map to empty outputs.
   */
  translateBatch(texts: string[], opts: TranslateOptions): Promise<string[]>;
}

/** Human-readable language names used in provider prompts / DeepL codes. */
const LOCALE_NAMES: Record<Locale, string> = {
  'zh-Hant': 'Traditional Chinese (zh-Hant, Hong Kong)',
  'zh-Hans': 'Simplified Chinese (zh-Hans)',
  en: 'English'
};

/** DeepL target language codes (uppercase). */
const DEEPL_TARGET: Record<Locale, string> = {
  'zh-Hant': 'ZH-HANT',
  'zh-Hans': 'ZH-HANS',
  en: 'EN-GB'
};

const DEEPL_SOURCE: Record<Locale, string> = {
  'zh-Hant': 'ZH',
  'zh-Hans': 'ZH',
  en: 'EN'
};

function isNonEmpty(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Run a request with exponential-backoff retries. Retries on transient network
 * errors (e.g. `fetch failed` / socket reset — common with long batches on the
 * Gemini/OpenAI-compatible endpoints) and on retryable HTTP status codes
 * (429 rate limit, 5xx). Non-retryable HTTP errors (e.g. 401/404) throw
 * immediately so misconfiguration surfaces fast.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  {
    attempts = 5,
    baseDelayMs = 1500,
    label = 'request'
  }: {attempts?: number; baseDelayMs?: number; label?: string} = {}
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable =
        err instanceof RetryableHttpError || isTransientNetworkError(err);
      if (!retryable || attempt === attempts) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.floor(Math.random() * 500);
      console.warn(
        `[mt] ${label} failed (attempt ${attempt}/${attempts}), retrying in ${delay}ms: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

/** Signals an HTTP status the caller may retry (429 / 5xx). */
class RetryableHttpError extends Error {}

/** Detect transient fetch/socket failures worth retrying. */
function isTransientNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === 'TypeError' && /fetch failed/i.test(err.message)) return true;
  const cause = (err as {cause?: {code?: string}}).cause;
  const code = cause?.code;
  return (
    code === 'UND_ERR_SOCKET' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    code === 'ECONNREFUSED'
  );
}

/**
 * Build the system prompt for the LLM engine: institutional tone, verbatim
 * preservation of numbers / symbols / codes, and the approved glossary.
 */
function buildSystemPrompt(opts: TranslateOptions): string {
  const source = LOCALE_NAMES[opts.sourceLocale];
  const target = LOCALE_NAMES[opts.targetLocale];
  const glossary = glossaryPrompt(opts.targetLocale);
  return [
    `You are a professional translator for the website of HATC (華安泰昌有限公司 / HATC Group Limited), a Hong Kong precious-metals trading company.`,
    `Translate each string from ${source} to ${target}.`,
    `Rules:`,
    `- Preserve EXACTLY, without translating or reformatting: numbers, prices, percentages, ratios (e.g. 1:500), spreads, trading symbols/codes (e.g. XAU/USD, MT4, MT5), currency symbols ($, ¥), URLs, email addresses, and any {placeholder} tokens.`,
    `- Keep an institutional, restrained, credible tone. Do not add, remove or embellish claims. Do not invent facts, figures, awards or testimonials.`,
    `- Do not add explanations or notes. Return only the translation of each input.`,
    glossary,
    `Return a JSON object of the exact shape {"translations": string[]} where translations[i] is the translation of input[i], preserving order and array length.`
  ]
    .filter(Boolean)
    .join('\n');
}

/** OpenAI-compatible chat-completions provider (default). */
class LlmProvider implements TranslationProvider {
  readonly id = 'llm';
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly model: string
  ) {}

  async translateBatch(texts: string[], opts: TranslateOptions): Promise<string[]> {
    if (texts.length === 0) return [];
    // Preserve empties; only send non-empty strings to the model.
    const indexed = texts.map((t, i) => ({i, t}));
    const toSend = indexed.filter((x) => isNonEmpty(x.t));
    if (toSend.length === 0) return texts.map(() => '');

    const system = buildSystemPrompt(opts);
    const userPayload = {inputs: toSend.map((x) => x.t)};

    const json = await withRetry(
      async () => {
        const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0,
            response_format: {type: 'json_object'},
            messages: [
              {role: 'system', content: system},
              {
                role: 'user',
                content: `Translate the "inputs" array. Respond with {"translations": [...]}.\n${JSON.stringify(
                  userPayload
                )}`
              }
            ]
          })
        });

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          const message = `LLM translate failed (${res.status}): ${body.slice(0, 300)}`;
          if (res.status === 429 || res.status >= 500) {
            throw new RetryableHttpError(message);
          }
          throw new Error(message);
        }

        return (await res.json()) as {
          choices?: {message?: {content?: string}}[];
        };
      },
      {label: `${opts.targetLocale} batch (${toSend.length} strings)`}
    );

    const content = json.choices?.[0]?.message?.content ?? '';
    let translations: unknown;
    try {
      translations = (JSON.parse(content) as {translations?: unknown}).translations;
    } catch {
      throw new Error('LLM translate returned non-JSON content');
    }
    if (!Array.isArray(translations) || translations.length !== toSend.length) {
      throw new Error('LLM translate returned mismatched array length');
    }

    const out = texts.map(() => '');
    toSend.forEach((x, k) => {
      const value = translations[k];
      out[x.i] = typeof value === 'string' ? value : String(value ?? '');
    });
    return out;
  }
}

/** DeepL provider (selectable via MT_PROVIDER=deepl). */
class DeeplProvider implements TranslationProvider {
  readonly id = 'deepl';
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly glossary: GlossaryEntry[]
  ) {}

  async translateBatch(texts: string[], opts: TranslateOptions): Promise<string[]> {
    if (texts.length === 0) return [];
    const indexed = texts.map((t, i) => ({i, t}));
    const toSend = indexed.filter((x) => isNonEmpty(x.t));
    if (toSend.length === 0) return texts.map(() => '');

    const params = new URLSearchParams();
    params.set('target_lang', DEEPL_TARGET[opts.targetLocale]);
    params.set('source_lang', DEEPL_SOURCE[opts.sourceLocale]);
    params.set('tag_handling', 'html');
    for (const x of toSend) params.append('text', x.t);
    void this.glossary; // DeepL glossary IDs are account-scoped; wiring TBD by owner.

    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`DeepL translate failed (${res.status}): ${body.slice(0, 300)}`);
    }
    const json = (await res.json()) as {translations?: {text?: string}[]};
    const results = json.translations ?? [];
    if (results.length !== toSend.length) {
      throw new Error('DeepL translate returned mismatched array length');
    }
    const out = texts.map(() => '');
    toSend.forEach((x, k) => {
      out[x.i] = results[k]?.text ?? '';
    });
    return out;
  }
}

/** True when a translation API key is configured (server-side only). */
export function isMtConfigured(): boolean {
  return Boolean(process.env.MT_API_KEY);
}

/**
 * Resolve the configured provider, or `null` when no API key is set. Callers
 * (endpoint, button, script) must degrade gracefully when this returns null so
 * the site keeps working without a key.
 */
export function getTranslationProvider(): TranslationProvider | null {
  const apiKey = process.env.MT_API_KEY;
  if (!apiKey) return null;

  const kind = (process.env.MT_PROVIDER || 'llm').toLowerCase();
  if (kind === 'deepl') {
    const baseUrl = process.env.MT_DEEPL_URL || 'https://api-free.deepl.com/v2';
    // Glossary is passed for future account-scoped wiring; prompt-style term
    // pinning is LLM-only.
    return new DeeplProvider(apiKey, baseUrl, glossaryFor('en'));
  }

  const baseUrl = process.env.MT_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.MT_MODEL || 'gpt-4o-mini';
  return new LlmProvider(apiKey, baseUrl, model);
}
