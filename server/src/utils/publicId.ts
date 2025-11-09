import { customAlphabet } from 'nanoid';

// Generate URL-safe public IDs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

export function generatePublicId(): string {
  return nanoid();
}
