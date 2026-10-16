export type WaitlistResult = { ok: true } | { ok: false; reason: 'invalid_email' | 'not_configured' | 'network' | 'server' };

const DEFAULT_TIMEOUT_MS = 10000;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  if (/\s/.test(trimmed)) return false;

  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return false;
  if (trimmed.indexOf('@', atIndex + 1) !== -1) return false;

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (localPart.length === 0) return false;
  if (domain.length === 0 || !domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;

  return true;
}

export async function submitWaitlist(opts: {
  endpoint: string | undefined;
  email: string;
  company?: string;
  source: 'hero' | 'closing';
  honeypot?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<WaitlistResult> {
  const { endpoint, email, company, source, honeypot, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;

  if (!isValidEmail(email)) {
    return { ok: false, reason: 'invalid_email' };
  }

  if (honeypot && honeypot.trim().length > 0) {
    return { ok: true };
  }

  if (!endpoint || endpoint.trim().length === 0) {
    return { ok: false, reason: 'not_configured' };
  }

  const formData = new FormData();
  formData.set('email', email.trim());
  if (company) formData.set('company', company);
  formData.set('source', source);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.ok) {
      return { ok: true };
    }
    return { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
