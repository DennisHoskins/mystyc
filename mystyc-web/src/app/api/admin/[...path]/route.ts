import { NextRequest } from 'next/server';
import { handleAdmin } from '../handlers/adminHandler';
import { logger } from '@/util/logger';

// Routes that only read from Redis cache
const REDIS_ONLY_ROUTES = new Set([
  'device-sessions/[deviceId]',
  'sessions',
  'sessions/devices',
  'stats/sessions', 
  'stats/traffic'
]);

// Routes that combine Redis + Nest data
const COMBINED_ROUTES = new Set([
  'stats'
]);

// Helper functions
function normalizeRoute(route: string): string {
  return route.replace(/\/[a-f0-9-]{8,}/gi, '/*');
}

function isRedisEnhancedRoute(route: string): boolean {
  return /^devices\/[^\/]+\/session$/.test(route);
}

function mapToNestEndpoint(route: string, path: string[]): { endpoint: string, routeParams: Record<string, string> } {
  const routeParams: Record<string, string> = {};
  let endpoint = route;

  logger.log(`[mapToNestEndpoint] Handling route: ${route}`, path);

  // Extract dynamic parameters based on patterns
  const patterns = [
    { pattern: /^users\/([^\/]+)/, param: 'firebaseUid' },
    { pattern: /^devices\/([^\/]+)/, param: 'deviceId' },
    { pattern: /^schedules\/([^\/]+)/, param: 'scheduleId' },
    { pattern: /^schedule-executions\/([^\/]+)/, param: 'scheduleExecutionId' },
    { pattern: /^notifications\/([^\/]+)/, param: 'notificationId' },
    { pattern: /^auth-events\/([^\/]+)/, param: 'authId' },
    { pattern: /^sessions\/([^\/]+)/, param: 'sessionId' },
    { pattern: /^content\/([^\/]+)/, param: 'contentId' },
  ];

  for (const { pattern, param } of patterns) {
    const match = route.match(pattern);
    if (match) {
      routeParams[param] = match[1];
      endpoint = endpoint.replace(match[1], `{${param}}`);
      break;
    }
  }

  return { endpoint, routeParams };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');
  const normalizedRoute = normalizeRoute(route);

  // Handle Redis-only routes
  if (REDIS_ONLY_ROUTES.has(normalizedRoute)) {
    const { handleRedisRoute } = await import('../handlers/redisHandler');
    return handleRedisRoute(request, route, path);
  }

  // Handle combined routes (Redis + Nest)
  if (COMBINED_ROUTES.has(normalizedRoute)) {
    const { handleCombinedRoute } = await import('../handlers/combinedHandler');
    return handleCombinedRoute(request, route, path);
  }

  // Handle Redis-enhanced routes (Nest + Redis lookup)
  if (isRedisEnhancedRoute(route)) {
    const { handleRedisEnhancedRoute } = await import('../handlers/redisEnhancedHandler');
    return handleRedisEnhancedRoute(request, route, path);
  }

  // Default: forward to Nest API
  const { endpoint, routeParams } = mapToNestEndpoint(route, path);
  const payload = await request.json();

  // Extract the client-sent “method” field
  const {
    method: explicitMethod,
    ...forwardPayload
  } = payload;

  // Compute a TS-safe verb (fallback to GET if none provided)
  const effectiveMethod =
    (explicitMethod?.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE')
    || 'GET';

  // Forward both the body and the verb into handleAdmin
  return handleAdmin(
    request,
    {
      endpoint,
      method: effectiveMethod,
    },
    routeParams,
    forwardPayload
  );
}