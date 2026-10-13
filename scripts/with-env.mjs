#!/usr/bin/env node
/**
 * Runs a command with one deployment environment's public defaults layered in.
 *
 * Usage: node scripts/with-env.mjs <local|uat|prd> <command> [args…]
 *        (see the build:* / start:* scripts in package.json)
 *
 * Precedence, highest first:
 *   1. real environment variables already set on the host / CI
 *   2. the repo's own `.env.local` / `.env`  (git-ignored, developer machines)
 *   3. `config/env/<name>.env`               (committed, public values only)
 *
 * Layer 2 is honoured by *name*: if a key appears in `.env.local` or `.env` at
 * all, this script leaves it alone so Next's own loader resolves it. Without
 * that check our defaults would silently outrank a developer's `.env.local`,
 * because Next looks at `process.env` before any `.env*` file.
 *
 * Why this exists at all instead of Next's `.env.<name>` convention: Next only
 * accepts `production` / `development` / `test` for NODE_ENV, so there is no
 * native file name for "uat".
 *
 * 🚩 Secrets never live in `config/env/*` — those files are committed, so any
 * key that looks like a credential is rejected (see SECRET_KEY_PATTERN).
 * `node scripts/with-env.mjs --check` validates all three files and is run by
 * CI. See docs/DEPLOYMENT.md §2.3.
 */

import {spawn} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configDir = join(repoRoot, 'config', 'env');

const [envName, command, ...commandArgs] = process.argv.slice(2);

function fail(message) {
  console.error(`[with-env] ${message}`);
  process.exit(1);
}

function availableEnvironments() {
  if (!existsSync(configDir)) return [];
  return readdirSync(configDir)
    .filter((f) => f.endsWith('.env'))
    .map((f) => f.replace(/\.env$/, ''));
}

/**
 * Minimal `KEY=value` parser for our own config files: `#` comments, optional
 * `export`, optional surrounding quotes, inline comments after unquoted
 * values. Multiline values are deliberately unsupported — keep these files
 * flat (anything complex belongs in a host environment variable anyway).
 */
function parseEnvFile(path) {
  const entries = [];
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    entries.push([key, value]);
  }
  return entries;
}

/**
 * `config/env/*` is committed, so a credential must never be declared there —
 * it belongs in a host environment variable or the git-ignored `.env`.
 * Deliberately a pattern rather than a fixed list so a future variable named
 * e.g. `PAYMENT_API_KEY` is caught without anyone remembering this file.
 */
const SECRET_KEY_PATTERN = /SECRET|TOKEN|PASSWORD|_KEY$|^DATABASE_URI$/;

/**
 * Printed whenever a credential is found in a committed config file. It spells
 * out the two correct places because the message is the only documentation
 * someone sees at the moment they hit this — the dev team put `DATABASE_URI`
 * into all three files twice (第六十三輪) despite the header comments.
 */
const SECRET_PLACEMENT_HELP = `secrets must live in the host's environment or the git-ignored .env, not in a committed file.

  Host environment (recommended for servers):
    export DATABASE_URI='mongodb://<user>:<pass>@<host>:27017/hatc-cms?authSource=admin'
    export PAYLOAD_SECRET="$(openssl rand -base64 32)"

  Or a .env created by hand on that machine (never committed):
    DATABASE_URI=mongodb://<user>:<pass>@<host>:27017/hatc-cms?authSource=admin
    PAYLOAD_SECRET=<any long random string>

  config/env/*.env is for public per-environment values only (site domain,
  SITE_INDEXABLE, quote-gateway host, operational-link fallbacks).
  See docs/DEPLOYMENT.md §2.3.`;

function secretKeysIn(path) {
  return parseEnvFile(path)
    .map(([key]) => key)
    .filter((key) => SECRET_KEY_PATTERN.test(key));
}

/** `--check`: validate every environment file. Used by CI. */
function checkAllFiles() {
  const environments = availableEnvironments();
  if (environments.length === 0) fail(`no *.env files found in ${configDir}`);

  const problems = [];
  for (const name of environments) {
    const file = join(configDir, `${name}.env`);
    for (const key of secretKeysIn(file)) {
      problems.push(`config/env/${name}.env declares credential-like key ${key}`);
    }
  }

  if (problems.length) {
    for (const problem of problems) console.error(`[with-env] ✗ ${problem}`);
    fail(SECRET_PLACEMENT_HELP);
  }

  console.log(`[with-env] ✓ ${environments.join(', ')} contain no credentials`);
  process.exit(0);
}

/** Key names declared in the developer's git-ignored env files. */
function localKeyNames() {
  const names = new Set();
  for (const file of ['.env.local', '.env']) {
    const path = join(repoRoot, file);
    if (!existsSync(path)) continue;
    for (const [key] of parseEnvFile(path)) names.add(key);
  }
  return names;
}

if (envName === '--check') {
  checkAllFiles();
}

if (!envName || !command) {
  fail('usage: node scripts/with-env.mjs <environment|--check> <command> [args…]');
}

const envFile = join(configDir, `${envName}.env`);
if (!existsSync(envFile)) {
  const available = availableEnvironments().join(', ') || '(none)';
  fail(`unknown environment "${envName}". Available: ${available}`);
}

const leaked = secretKeysIn(envFile);
if (leaked.length) {
  console.error(
    `[with-env] ✗ config/env/${envName}.env declares credential-like key(s) ${leaked.join(', ')}`
  );
  fail(SECRET_PLACEMENT_HELP);
}

const locallyDefined = localKeyNames();
const childEnv = {...process.env};
const applied = [];
const deferred = [];

for (const [key, value] of parseEnvFile(envFile)) {
  if (key in process.env) {
    deferred.push(`${key} (host)`);
    continue;
  }
  if (locallyDefined.has(key)) {
    deferred.push(`${key} (.env)`);
    continue;
  }
  childEnv[key] = value;
  applied.push(key);
}

console.log(
  `[with-env] ${envName}: applied ${applied.length} default(s) from config/env/${envName}.env` +
    (deferred.length ? `; kept existing ${deferred.join(', ')}` : '')
);

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: childEnv,
  shell: process.platform === 'win32'
});

child.on('error', (error) => fail(`failed to run "${command}": ${error.message}`));
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
