import crypto from 'crypto';

/**
 * Generates 10 secure backup codes for MFA recovery
 */
export const generateBackupCodes = (): string[] => {
  return Array.from({ length: 10 }, () => 
    crypto.randomBytes(5).toString('hex').toUpperCase()
  );
};

/**
 * Hashes a backup code for secure storage
 */
export const hashBackupCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};
