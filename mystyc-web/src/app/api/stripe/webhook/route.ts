import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/util/logger';

export async function POST(request: NextRequest) {
  try {
    logger.log("[stripeWebhook] got POST");

    // Get raw body as ArrayBuffer, then convert to Buffer
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const stripeSignature = request.headers.get('stripe-signature');
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');

    logger.log("[stripeWebhook] got headers", stripeSignature, xForwardedFor, userAgent);
    
    if (stripeSignature) headers['stripe-signature'] = stripeSignature;
    if (xForwardedFor) headers['x-forwarded-for'] = xForwardedFor;
    if (userAgent) headers['user-agent'] = userAgent;
    
    // Forward to NestJS with Buffer body
    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/stripe/webhook`, {
        method: 'POST',
        headers,
        body: bodyBuffer
      });

    const data = await nestResponse.json();
    logger.log("[stripeWebhook] Nest reply", data);

    return NextResponse.json(data, { status: nestResponse.status });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ error: 'Webhook proxy failed' }, { status: 500 });
  }
}