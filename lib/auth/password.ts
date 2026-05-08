import { compare, hash } from "bcryptjs";

/**
 * Hashes a plain password before storing it in the database.
 * The hash output is what we save in User.passwordHash.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, 12);
}

/**
 * Verifies a plain password against a stored hash.
 * Returns true only when the user entered the correct password.
 */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(plainPassword, passwordHash);
}

