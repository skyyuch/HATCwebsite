import 'server-only';

import type {Payload} from 'payload';

/** True when a Postgres connection string is configured. */
export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URI);
}

let payloadPromise: Promise<Payload> | null = null;

/** Shared Payload client (singleton per process). */
export async function getPayloadClient(): Promise<Payload> {
  if (!hasDb()) {
    throw new Error('DATABASE_URI is not configured');
  }

  if (!payloadPromise) {
    payloadPromise = (async () => {
      const {getPayload} = await import('payload');
      const config = (await import('@payload-config')).default;
      return getPayload({config});
    })();
  }

  return payloadPromise;
}
