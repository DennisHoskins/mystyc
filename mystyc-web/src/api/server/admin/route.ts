import { NextRequest } from 'next/server';
import { API_BASE_URL, ServerRequestHandler } from '../ServerRequestHandler';

async function getAdminData(authToken: string | null, dto: any) {
  const { endpoint, ...queryParams } = dto;
  
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`${API_BASE_URL}/admin/${endpoint}${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}

async function postAdminData(authToken: string | null, dto: any) {
  const { endpoint, ...requestData } = dto;

  const response = await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}

async function patchAdminData(authToken: string | null, dto: any) {
  const { endpoint, ...requestData } = dto;

  const response = await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  return ServerRequestHandler.handle(request, {getAdminData});
}

export async function POST(request: NextRequest) {
  return ServerRequestHandler.handle(request, {postAdminData});
}

export async function PATCH(request: NextRequest) {
  return ServerRequestHandler.handle(request, {patchAdminData});
}