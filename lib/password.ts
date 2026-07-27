import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const HASH_PREFIX = "scrypt"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = scryptSync(password, salt, 64).toString("hex")
  return `${HASH_PREFIX}$${salt}$${derivedKey}`
}

export function verifyPassword(password: string, storedPassword: string) {
  if (!storedPassword.startsWith(`${HASH_PREFIX}$`)) {
    return password === storedPassword
  }

  const [, salt, hash] = storedPassword.split("$")
  if (!salt || !hash) {
    return false
  }

  const derivedKey = scryptSync(password, salt, 64)
  const storedKey = Buffer.from(hash, "hex")

  if (storedKey.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(storedKey, derivedKey)
}
