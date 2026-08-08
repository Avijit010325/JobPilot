import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Client Config with environment fallback
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDemoJobPilotClientApiKey123456789',
  authDomain: 'jobpilot-ai-assistant.firebaseapp.com',
  projectId: 'jobpilot-ai-assistant',
  storageBucket: 'jobpilot-ai-assistant.appspot.com',
  messagingSenderId: '102938475612',
  appId: '1:102938475612:web:abcdef0123456789',
};

// Initialize Firebase once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Helper to sign in with Google Popup
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('[Firebase Auth] Google popup sign-in fallback:', error);
    throw error;
  }
}

/**
 * Rate Limiter for Client-side & API endpoints
 * Prevents rapid abuse of expensive operations (AI generation, auth attempts)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60000): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Sanitizer against XSS & script injection
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim();
}
