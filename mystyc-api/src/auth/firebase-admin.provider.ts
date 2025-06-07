import * as admin from 'firebase-admin';

import { logger } from '@/common/util/logger';

// Environment Variable Validation

// Required Firebase service account configuration environment variables
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

/**
 * Validates that all required Firebase environment variables are present
 * Logs missing variables for debugging and throws error if any are missing
 */
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required Firebase environment variables', {
    missingVars,
    availableVars: requiredEnvVars.filter(varName => !!process.env[varName])
  });
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Private Key Processing and Validation

/**
 * Processes and validates Firebase private key from environment variable
 * Handles newline character replacement and validates PEM format
 * @throws Error for malformed or invalid private key format
 */
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

// Service Account Configuration

/**
 * Firebase service account configuration object
 * Built from validated environment variables for secure Firebase Admin SDK initialization
 */
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

// Firebase Admin SDK Initialization

/**
 * Initializes Firebase Admin SDK with service account credentials
 * Provides server-side access to Firebase Authentication and other services
 * @throws Error if initialization fails due to invalid credentials or configuration
 */
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

/**
 * Exported Firebase Admin SDK instance
 * Provides access to authentication, database, and other Firebase services
 * Used throughout the application for server-side Firebase operations
 */
export const firebaseAdmin = admin;