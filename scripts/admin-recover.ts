/**
 * Admin account recovery for `/admin` — inspect, unlock, reset password.
 *
 * Needed because the CMS has **no outbound email configured**, so the
 * 「忘記密碼」flow on the login screen cannot deliver a reset link. Recovery has
 * to happen on the host, and this runs through Payload's Local API so it works
 * without `mongosh` and keeps the password hashing/validation rules intact
 * (never edit `users.hash` directly in the database).
 *
 * Usage (needs DATABASE_URI + PAYLOAD_SECRET, hence `payload:<env>` rather than
 * the bare `payload` script — that one skips `scripts/with-env.mjs` and so never
 * loads `config/env/<env>.secrets.env`, failing with "missing secret key"):
 *
 *   # 1. Who exists, and is anyone locked out?
 *   npm run payload:prd -- run scripts/admin-recover.ts
 *
 *   # 2. Clear a lockout (Payload locks an account for 10 minutes after 5
 *   #    failed attempts; the login screen just says the credentials are wrong)
 *   npm run payload:prd -- run scripts/admin-recover.ts -- --unlock you@example.com
 *
 *   # 3. Set a new password. Passed via the environment, NOT as an argument, so
 *   #    it does not end up in the shell history or in `ps` output.
 *   ADMIN_NEW_PASSWORD='…' \
 *     npm run payload:prd -- run scripts/admin-recover.ts -- --reset you@example.com
 *
 * On the production host prefix with the node path (docs/DEPLOYMENT.md §2.0b):
 *   sudo env PATH=/www/server/nodejs/v22.22.3/bin:$PATH npm run payload:prd -- run …
 *
 * 🚩 This bypasses access control on purpose (`overrideAccess: true`) — it can
 * only be run by someone who already has a shell on the host and the database
 * credentials. It never prints password hashes and never creates an account:
 * the first account is created by `onInit` / the `/admin` first-run screen.
 */
import {getPayload} from 'payload';

import config from '@payload-config';

const args = process.argv.slice(2);

function flagValue(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const unlockEmail = flagValue('--unlock');
const resetEmail = flagValue('--reset');

/**
 * `payload.unlock` reuses the login operation's data type, so TypeScript demands a
 * `password` the operation never reads (`unlock.js` only looks at `data.email`).
 */
function unlockData(email: string) {
  return {email} as {email: string; password: string};
}

const payload = await getPayload({config});

async function findUser(email: string) {
  const {docs} = await payload.find({
    collection: 'users',
    where: {email: {equals: email.trim().toLowerCase()}},
    limit: 1,
    depth: 1,
    overrideAccess: true
  });
  return docs[0];
}

async function list(): Promise<void> {
  const {docs, totalDocs} = await payload.find({
    collection: 'users',
    limit: 100,
    depth: 1,
    overrideAccess: true
  });

  payload.logger.info(`users: ${totalDocs}`);
  for (const user of docs) {
    const role = user.role;
    const roleLabel =
      role && typeof role === 'object'
        ? `${role.name}${role.fullAccess ? ' (full access)' : ''}`
        : role
          ? `id ${String(role)}`
          : 'NO ROLE — cannot use /admin';
    // `lockUntil` / `loginAttempts` are auth internals, not typed on the doc.
    const auth = user as unknown as {lockUntil?: string | null; loginAttempts?: number};
    const lockedUntil = auth.lockUntil ? new Date(auth.lockUntil) : null;
    const locked = lockedUntil !== null && lockedUntil.getTime() > Date.now();
    payload.logger.info(
      `  ${user.email} — role: ${roleLabel}; failed attempts: ${auth.loginAttempts ?? 0}` +
        (locked ? `; 🔒 LOCKED until ${lockedUntil.toISOString()}` : '')
    );
  }
}

if (unlockEmail) {
  const user = await findUser(unlockEmail);
  if (!user) {
    payload.logger.error(`No user with email ${unlockEmail} — run without flags to list.`);
    process.exit(1);
  }
  await payload.unlock({collection: 'users', data: unlockData(user.email), overrideAccess: true});
  payload.logger.info(`Unlocked ${user.email}.`);
} else if (resetEmail) {
  const password = process.env.ADMIN_NEW_PASSWORD;
  if (!password || password.length < 8) {
    payload.logger.error(
      'Set ADMIN_NEW_PASSWORD (at least 8 characters) in the environment, e.g.\n' +
        "  ADMIN_NEW_PASSWORD='…' npm run payload -- run scripts/admin-recover.ts -- --reset you@example.com"
    );
    process.exit(1);
  }
  const user = await findUser(resetEmail);
  if (!user) {
    payload.logger.error(`No user with email ${resetEmail} — run without flags to list.`);
    process.exit(1);
  }
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {password},
    overrideAccess: true
  });
  // A reset is pointless while the account is still locked out.
  await payload.unlock({collection: 'users', data: unlockData(user.email), overrideAccess: true});
  payload.logger.info(`Password updated and lockout cleared for ${user.email}.`);
} else {
  await list();
}

process.exit(0);
