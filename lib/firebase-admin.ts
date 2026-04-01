import * as admin from 'firebase-admin';

if (!admin.apps.length && process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const mockAuth = {
  verifySessionCookie: async () => { 
    throw new Error('Firebase Admin not initialized');
  },
  createSessionCookie: async () => { 
    throw new Error('Firebase Admin not initialized');
  },
  verifyIdToken: async () => {
    throw new Error('Firebase Admin not initialized');
  }
} as unknown as admin.auth.Auth;

/**
 * Proxy object that redirects all calls to the actual Firebase Auth instance
 * if initialized, otherwise returns a mock that throws descriptive errors.
 */
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    const activeAuth = admin.apps.length > 0 ? admin.auth() : mockAuth;
    return (activeAuth as any)[prop];
  }
});
