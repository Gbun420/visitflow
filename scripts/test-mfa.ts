import * as admin from 'firebase-admin';
import { adminAuth } from '../lib/firebase-admin';

async function run() {
  console.log("Starting...");
  try {
    // Force initialization if needed
    // @ts-ignore
    await adminAuth.verifyIdToken('x').catch(() => {});
  } catch (e) {}

  if (!admin.apps.length) {
    console.error("Firebase Admin not initialized!");
    process.exit(1);
  }

  const pcm = admin.auth().projectConfigManager();
  try {
    await pcm.updateProjectConfig({
      multiFactorConfig: {
        state: 'ENABLED',
        factorIds: ['phone']
      }
    });
    console.log("MFA successfully enabled and set to Optional!");
    process.exit(0);
  } catch (err: any) {
    console.log("Failed to enable MFA:", err?.message || err);
    process.exit(1);
  }
}
run();
