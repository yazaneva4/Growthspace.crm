const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

// Per-instance sliding window. Serverless instances are recycled and are not
// shared, so this is a speed bump that stops one client from running up the AI
// providers' bill, not an account-level quota.
const hits = new Map<string, number[]>();

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** True when this caller has exceeded `max` requests in the window. */
export function tooManyRequests(
  req: { headers: { get(name: string): string | null } },
  name: string,
  max = 20,
  windowMs = DEFAULT_WINDOW_MS
): boolean {
  const key = `${name}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 20000) hits.clear();
  return recent.length > max;
}
