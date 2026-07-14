// Rate limiter em memória — protege instâncias quentes.
// Para proteção completa em produção, use Upstash Redis (ver PENDÊNCIAS).
interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  if (process.env.NODE_ENV === 'test') return true
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function rateLimitKey(req: Request, prefix: string): string {
  const ip =
    (req.headers as any).get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
    (req.headers as any).get?.('x-real-ip') ??
    'unknown'
  return `${prefix}:${ip}`
}
