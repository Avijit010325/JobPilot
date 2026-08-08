import { describe, it, expect } from 'vitest';
import { checkRateLimit, sanitizeInput } from '../lib/firebase';

describe('Security & Rate Limiting Engine', () => {
  it('should allow calls within the maximum rate limit threshold', () => {
    const key = `test_rate_user_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const check = checkRateLimit(key, 10, 60000);
      expect(check.allowed).toBe(true);
      expect(check.retryAfterMs).toBe(0);
    }
  });

  it('should block calls exceeding the rate limit and return retry duration', () => {
    const key = `test_rate_user_exceed_${Date.now()}`;
    // Max 3 calls allowed
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60000);
    }

    // 4th call should be throttled
    const blocked = checkRateLimit(key, 3, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });
});

describe('Input Sanitization & Injection Defense', () => {
  it('should strip dangerous HTML angle brackets to prevent XSS payloads', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    expect(sanitizeInput('<img src=x onerror=alert(1)>')).toBe('img src=x onerror=alert(1)');
    expect(sanitizeInput('Clean text without tags')).toBe('Clean text without tags');
  });

  it('should handle null/undefined/empty input gracefully', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });
});

describe('URL Scheme Validation', () => {
  function isValidHttpUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  it('should validate secure and standard web protocols', () => {
    expect(isValidHttpUrl('https://linkedin.com/in/alex')).toBe(true);
    expect(isValidHttpUrl('http://myportfolio.dev')).toBe(true);
  });

  it('should block dangerous pseudo-protocols such as javascript: or data:', () => {
    expect(isValidHttpUrl('javascript:alert(document.cookie)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidHttpUrl('vbscript:msgbox(1)')).toBe(false);
  });
});
