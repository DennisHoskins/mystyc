import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

export class ServerRequestHandler {
  static async handle(
    request: NextRequest, 
    actionHandlers: Record<string, (authToken: string | null, dto: any) => Promise<any>>, 
    requireAuth = true
  ) {
    try {
      let authToken: string | null = null;
      
      if (requireAuth) {
        authToken = await getAuthToken();
        if (!authToken) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      const body = await request.json();
      const { action, dto } = body;
      
      const handler = actionHandlers[action];
      if (!handler) {
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
      }

      const result = await handler(authToken, dto);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Internal server error' }, 
        { status: 500 }
      );
    }
  }
}