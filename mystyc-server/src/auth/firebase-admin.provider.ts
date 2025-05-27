import * as admin from 'firebase-admin';

import { logger } from '@/util/logger';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_CERT_URL',
  'FIREBASE_CLIENT_CERT_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required Firebase environment variables', {
    missingVars,
    availableVars: requiredEnvVars.filter(varName => !!process.env[varName])
  });
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Safely process the private key
let privateKey: string;
try {
  privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  
  // Validate private key format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || 
      !privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Private key appears to be malformed');
  }
  
  logger.info('Firebase private key processed successfully');
} catch (error) {
  logger.error('Failed to process Firebase private key', { 
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  throw new Error('Invalid Firebase private key format');
}

const serviceAccountConfig = {
  type: 'service_account' as const,
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID!,
  auth_uri: process.env.FIREBASE_AUTH_URI!,
  token_uri: process.env.FIREBASE_TOKEN_URI!,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL!,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL!
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountConfig as admin.ServiceAccount),
  });
  
  logger.info('Firebase Admin SDK initialized successfully', {
    projectId: process.env.FIREBASE_PROJECT_ID
  });
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK', {
    error: error instanceof Error ? error.message : 'Unknown error',
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  throw error;
}

export const firebaseAdmin = admin;