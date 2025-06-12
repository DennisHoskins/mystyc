import { NextRequest } from 'next/server';
import { createClient } from 'redis';

const NEST_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis (do this once)
redis.connect().catch(console.error);

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  try {
    // Extract path from URL
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/server/', '');

console.log('NEST_BASE_URL:', NEST_BASE_URL);
console.log('Full URL:', `${NEST_BASE_URL}/${path}`);

    // Get request body
    const body = await request.json();
    const { action, dto } = body;
    
    if (action === 'registerSession') {
      // Get auth token from request headers
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return Response.json({ error: 'Missing auth token' }, { status: 401 });
      }
      
      // Register flow: forward to Nest with auth header
      const response = await fetch(`${NEST_BASE_URL}/${path}`, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(dto)
      });

      if (response.ok) {
        // SUCCESS: Store token in Redis
        const authToken = authHeader.replace('Bearer ', '');
        const authKey = `auth:${dto.firebaseUid}:${dto.device.deviceId}`;
        await redis.set(authKey, authToken);
        
        const data = await response.json();
        return Response.json(data);
      } else {
        // FAILURE: Clear any Redis entries for this user
        const authKey = `auth:${dto.firebaseUid}:${dto.device.deviceId}`;
        await redis.del(authKey);
        
        const errorText = await response.text();
        return Response.json({ error: errorText }, { status: response.status });
      }
    } else {
      // Normal flow: get token from Redis, forward with auth header
      const { firebaseUid, deviceId } = dto;
      
      if (!firebaseUid || !deviceId) {
        return Response.json({ error: 'Missing auth data' }, { status: 400 });
      }
      
      // Get token from Redis
      const authKey = `auth:${firebaseUid}:${deviceId}`;
      const token = await redis.get(authKey);
      
      if (!token) {
        return Response.json({ error: 'No auth token found' }, { status: 401 });
      }
      
      // Forward to Nest with auth header
      const response = await fetch(`${NEST_BASE_URL}/${path}`, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dto)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ error: errorText }, { status: response.status });
      }
      
      const data = await response.json();
      return Response.json(data);
    }
    
  } catch (error) {
    console.error('API Route Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}