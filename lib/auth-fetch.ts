import { auth } from '@/lib/firebase/client';

/**
 * Fetch wrapper that automatically adds the Firebase Auth token.
 * Use this for all API calls that require authentication.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Non authentifié');
  }

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
