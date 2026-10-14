#!/usr/bin/env node
/**
 * Runs a command with one deployment environment's public defaults layered in.
 *
 * Usage: node scripts/with-env.mjs <local|uat|prd> <command> [args…]
 *        (see the build:* / start:* scripts in package.json)
 *
 * Precedence, highest first:
 *   1. real environment variables already set on the host / CI
 *   2. `config/env/<name>.secrets.env`       (git-ignored, per-environment)
 *   3. the repo's own `.env.local` / `.env`  (git-ignored, machine-wide)
 *   4. `config/env/<name>.env`               (committed, public values only)
 *
 * Layer 3 is honoured by *name*: if a key appears in `.env.local` or `.env` at
 * all, layer 4 leaves it alone so Next's own loader resolves it. Without that
 * check our public defaults would silently outrank a developer's `.env.local`,
 * because Next looks at `process.env` before any `.env*` file.
 *
 * Layer 2 deliberately does NOT defer that way: a value chosen for *this*
 * environment must beat a machine-wide `.env`, exactly like Next's own
 * `.env.production.local` beats `.env.local`. It exists so one build machine
 * can hold every environment's credentials and switch with `build:uat` /
 * `build:prd` alone, editing nothing in between.
 *
 * Why this exists at all instead of Next's `.env.<name>` convention: Next only
 * accepts `production` / `development` / `test` for NODE_ENV, so there is no
 * native file name for "uat".
 *
 * 🚩 Secrets never live in `config/env/<name>.env` — those files are committed,
 * so any key that looks like a credential is rejected (see
 * SECRET_KEY_PATTERN); they belong in the `.secrets.env` sibling, which is
 * git-ignored. `node scripts/with-env.mjs --check` validates every committed
 * file, and verifies that any `.secrets.env` present really is ignored, and is
 * run by CI. See docs/DEPLOYMENT.md §2.3 / §2.3a.
 */

import {execFileSync, spawn} from 'node:child_process';
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
    .filter((f) => f.endsWith('.env') && !f.endsWith('.secrets.env'))
    .map((f) => f.replace(/\.env$/, ''));
}

/** Git-ignored per-environment credentials file. */
function secretsFileFor(name) {
  return join(configDir, `${name}.secrets.env`);
}

/**
 * Minimal `KEY=value` parser for our own config files: `#` comments, optional
 * `export`, optional surrounding quotes, inline comments after unquoted
 * values. Multiline values are deliberately unsupported — keep these files
 * flat (anything complex belongs in a host environment variable anyway).
 */
/**
 * Minimal `.env` parser: `KEY=value`, optional `export `, `#` comments, and
 * surrounding quotes stripped.
 *
 * 🚩 Keep values that contain spaces, parentheses or other shell metacharacters
 * **quoted** in `config/env/*.env`. This parser does not care either way, but
 * people do `set -a; . config/env/prd.env` when debugging on a host, and an
 * unquoted `CONTACT_PHONE=(852) 2322 2888` aborts that sourcing with a baffling
 * `2322: command not found` — every variable after it silently ends up empty.
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
const SECRET_PLACEMENT_HELP = `config/env/*.env is committed, so it may only hold public per-environment
  values (site domain, SITE_INDEXABLE, quote-gateway host, operational-link
  fallbacks). Credentials go in one of these instead:

  A. config/env/<name>.secrets.env — git-ignored, one file per environment.
     Use this to keep every environment configured on one machine and switch
     with build:uat / build:prd alone, editing nothing in between:
       echo "DATABASE_URI=mongodb://<user>:<pass>@<host>:27017/hatc-cms?authSource=admin" >> config/env/prd.secrets.env
       echo "PAYLOAD_SECRET=$(openssl rand -base64 32)" >> config/env/prd.secrets.env

  B. The host's own environment — best on a server that only ever runs one
     environment, and the only option on a CI runner:
       export DATABASE_URI='mongodb://<user>:<pass>@<host>:27017/hatc-cms?authSource=admin'
       export PAYLOAD_SECRET="$(openssl rand -base64 32)"

  See docs/DEPLOYMENT.md §2.3 / §2.3a.`;

function secretKeysIn(path) {
  return parseEnvFile(path)
    .map(([key]) => key)
    .filter((key) => SECRET_KEY_PATTERN.test(key));
}

/**
 * True when git would ignore `path`. Returns `null` when git cannot answer
 * (no git binary, not a working tree) so callers can skip the check instead of
 * failing a build for an unrelated reason.
 */
function isGitIgnored(path) {
  try {
    execFileSync('git', ['check-ignore', '-q', path], {cwd: repoRoot, stdio: 'ignore'});
    return true;
  } catch (error) {
    // Exit code 1 = "not ignored"; anything else = git could not tell us.
    return error.status === 1 ? false : null;
  }
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

    // The dev team deleted the `.env*` ignore rule once already (第六十三輪),
    // which is the one mistake that would publish these files to a public
    // remote. Catch it here rather than in a code review.
    const secretsFile = secretsFileFor(name);
    if (existsSync(secretsFile) && isGitIgnored(secretsFile) === false) {
      problems.push(
        `config/env/${name}.secrets.env exists but git is NOT ignoring it — ` +
          'restore the `config/env/*.secrets.env` rule in .gitignore'
      );
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
/** Keys seen in the secrets file, regardless of whether their value is empty. */
const secretsKeys = new Set();
const deferred = [];
const secretsApplied = [];

// Layer 2: this environment's own credentials. Applied before the public
// defaults and, unlike them, allowed to outrank a machine-wide `.env` — it was
// written for this environment specifically.
const secretsFile = secretsFileFor(envName);
if (existsSync(secretsFile)) {
  if (isGitIgnored(secretsFile) === false) {
    fail(
      `config/env/${envName}.secrets.env holds credentials but git is NOT ignoring it.\n` +
        '  Restore the `config/env/*.secrets.env` rule in .gitignore before building.'
    );
  }
  for (const [key, value] of parseEnvFile(secretsFile)) {
    if (key in process.env) {
      deferred.push(`${key} (host)`);
      continue;
    }
    childEnv[key] = value;
    secretsKeys.add(key);
    // A key with an empty value is almost always a template placeholder that was
    // never filled in, and every consumer treats it as "feature disabled" — so it
    // has to be called out. Reading the key name alone has already cost us real
    // debugging time twice (QUOTE_HTTP_CRYPT_SECRET, then MT_API_KEY).
    secretsApplied.push(value.trim() === `` ? `${key} ⚠ EMPTY` : key);
  }
}

// Layer 4: committed public defaults.
for (const [key, value] of parseEnvFile(envFile)) {
  if (key in process.env) {
    deferred.push(`${key} (host)`);
    continue;
  }
  if (secretsKeys.has(key)) {
    deferred.push(`${key} (${envName}.secrets.env)`);
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
    (secretsApplied.length
      ? `; ${secretsApplied.length} value(s) from ${envName}.secrets.env (${secretsApplied.join(', ')})`
      : '') +
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
