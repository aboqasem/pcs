import passwords from 'secure-random-password';

export function generateRandomPassword(length = 10): string {
  return passwords.randomPassword({ length });
}
