import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin for the server.
 * Handles different environment variable configurations (B64 or individual vars).
 */
const initAdmin = () => {
  // If already initialized, return the existing app.
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // During build, don't initialize to prevent errors in certain environments.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  try {
    // 1. Try B64 Service Account
    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // 2. Try individual env vars
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (privateKey && clientEmail && projectId) {
      // Robust private key formatting for different environments (Vercel/Local)
      let formattedKey = privateKey;
      
      // Remove wrapping quotes if they exist
      if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
        formattedKey = formattedKey.substring(1, formattedKey.length - 1);
      }
      
      // Handle literal \n strings (common in Vercel UI)
      formattedKey = formattedKey.replace(/\\n/g, '\n');

      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
      });
    }

    // No valid configuration found
    console.warn('⚠️ Firebase Admin Environment Variables Missing.');
    return null;
  } catch (error: any) {
    console.error('🔴 Firebase Admin Initialization Error:', error.message);
    return null;
  }
};

// Initialize once
const app = initAdmin();

/**
 * Export a wrapper for auth that handles the initialization check.
 */
export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    if (!app) throw new Error('Firebase Admin not initialized');
    return admin.auth(app).verifyIdToken(idToken);
  },
  createSessionCookie: async (idToken: string, options: admin.auth.SessionCookieOptions) => {
    if (!app) throw new Error('Firebase Admin not initialized');
    return admin.auth(app).createSessionCookie(idToken, options);
  },
  verifySessionCookie: async (sessionCookie: string, checkRevoked?: boolean) => {
    if (!app) throw new Error('Firebase Admin not initialized');
    return admin.auth(app).verifySessionCookie(sessionCookie, checkRevoked);
  }
} as admin.auth.Auth;
