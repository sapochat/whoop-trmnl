import { kv } from '@vercel/kv';

// Token storage keys
const TOKEN_KEY_PREFIX = 'whoop:token:';
const USER_KEY_PREFIX = 'whoop:user:';

// Types
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in milliseconds
}

export interface UserData {
  id: string;
  email?: string;
  name?: string;
  createdAt: number; // timestamp in milliseconds
  lastLogin: number; // timestamp in milliseconds
}

/**
 * Store token data for a user
 * @param userId - The user ID
 * @param tokenData - The token data to store
 */
export async function storeTokenData(userId: string, tokenData: TokenData): Promise<void> {
  await kv.set(`${TOKEN_KEY_PREFIX}${userId}`, JSON.stringify(tokenData));
}

/**
 * Get token data for a user
 * @param userId - The user ID
 * @returns The token data, or null if not found
 */
export async function getTokenData(userId: string): Promise<TokenData | null> {
  const data = await kv.get(`${TOKEN_KEY_PREFIX}${userId}`);
  return data ? JSON.parse(data as string) : null;
}

/**
 * Delete token data for a user
 * @param userId - The user ID
 */
export async function deleteTokenData(userId: string): Promise<void> {
  await kv.del(`${TOKEN_KEY_PREFIX}${userId}`);
}

/**
 * Store user data
 * @param userId - The user ID
 * @param userData - The user data to store
 */
export async function storeUserData(userId: string, userData: UserData): Promise<void> {
  await kv.set(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(userData));
}

/**
 * Get user data
 * @param userId - The user ID
 * @returns The user data, or null if not found
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  const data = await kv.get(`${USER_KEY_PREFIX}${userId}`);
  return data ? JSON.parse(data as string) : null;
}

/**
 * Create a new user
 * @param userData - The user data
 * @returns The user ID
 */
export async function createUser(userData: Omit<UserData, 'createdAt' | 'lastLogin'>): Promise<string> {
  const userId = userData.id;
  const now = Date.now();
  
  await storeUserData(userId, {
    ...userData,
    createdAt: now,
    lastLogin: now
  });
  
  return userId;
}

/**
 * Update user's last login time
 * @param userId - The user ID
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  const userData = await getUserData(userId);
  if (userData) {
    await storeUserData(userId, {
      ...userData,
      lastLogin: Date.now()
    });
  }
}
