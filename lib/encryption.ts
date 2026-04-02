import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const KEY_LENGTH = 32
const ITERATIONS = 100000

// In production, this should be a strong, random, securely stored secret.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_change_me_in_prod_123'

/**
 * Derives a key from the provided secret using PBKDF2
 */
function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Encrypts a string using AES-256-GCM
 */
export function encryptField(text: string | null | undefined): string | null {
  if (!text) return text as any

  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = getKey(salt)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  // Format: salt:iv:tag:encryptedData
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts a string using AES-256-GCM
 */
export function decryptField(encryptedText: string | null | undefined): string | null {
  if (!encryptedText) return encryptedText as any

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 4) return encryptedText // Return as-is if not in our encrypted format (e.g. legacy data)

    const [saltHex, ivHex, tagHex, encryptedDataHex] = parts
    
    const salt = Buffer.from(saltHex, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const encryptedData = Buffer.from(encryptedDataHex, 'hex')
    const key = getKey(salt)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    return decipher.update(encryptedData) + decipher.final('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    return null // Return null on decryption failure to avoid leaking bad data or crashing
  }
}
