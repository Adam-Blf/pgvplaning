/**
 * Système de limitation de débit (Rate Limiting) - En mémoire
 *
 * Limite le nombre de requêtes par identifiant (IP) dans une fenêtre de temps.
 * Utilisé pour protéger les APIs contre les abus et attaques par force brute.
 *
 * RECOMMANDATION PRODUCTION :
 * Pour un déploiement multi-instances, remplacer par Redis via @upstash/ratelimit :
 *
 * ```bash
 * npm install @upstash/ratelimit @upstash/redis
 * ```
 *
 * Variables d'environnement nécessaires :
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * L'implémentation actuelle utilise une Map en mémoire :
 * - Se réinitialise au redémarrage du serveur
 * - Ne partage pas l'état entre instances
 * - Adaptée au développement et aux déploiements mono-instance
 */

/** Entrée de suivi pour un identifiant */
interface RateLimitEntry {
  count: number;    // Nombre de requêtes dans la fenêtre
  resetAt: number;  // Timestamp de réinitialisation (ms)
}

// Stockage en mémoire (se réinitialise au redémarrage)
const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées (toutes les minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 60000);
}

/** Configuration d'une règle de limitation */
interface RateLimitConfig {
  limit: number;     // Nombre maximum de requêtes dans la fenêtre
  windowMs: number;  // Taille de la fenêtre en millisecondes
}

/** Résultat d'une vérification de limite */
interface RateLimitResult {
  success: boolean;     // true si la requête est autorisée
  limit: number;        // Limite configurée
  remaining: number;    // Requêtes restantes
  reset: number;        // Timestamp de réinitialisation
  retryAfter?: number;  // Secondes avant de réessayer (si bloqué)
}

/**
 * Check rate limit for an identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 10, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = store.get(key);

  // If no entry or expired, create new
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    reset: entry.resetAt,
    retryAfter: success ? undefined : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Team operations: 10 requests per minute
  teams: { limit: 10, windowMs: 60000 },
  // Join team: 5 attempts per minute (prevent brute force on codes)
  teamJoin: { limit: 5, windowMs: 60000 },
  // LLM requests: 3 per minute (expensive)
  llm: { limit: 3, windowMs: 60000 },
  // Leave info: 20 per minute (frequent checks)
  leaveInfo: { limit: 20, windowMs: 60000 },
  // Default
  default: { limit: 30, windowMs: 60000 },
} as const;

/**
 * Get client identifier from request headers
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get real IP from common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'anonymous';
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    ...(result.retryAfter ? { 'Retry-After': result.retryAfter.toString() } : {}),
  };
}
