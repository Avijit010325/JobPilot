export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'apple' | 'linkedin';
}

export interface RegisteredAccount {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  provider: 'email' | 'google' | 'apple' | 'linkedin';
  avatarUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = 'jobpilot_registered_users_v1';
const SESSION_KEY = 'jobpilot_session_v1';

/* ──────────────────────────────────────────────────────
   Helpers: read / write the user registry to localStorage
─────────────────────────────────────────────────────── */
export function getRegisteredUsers(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: RegisteredAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // localStorage might be unavailable
  }
}

export function findUserByEmail(email: string): RegisteredAccount | undefined {
  return getRegisteredUsers().find(
    u => u.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
}

/* ──────────────────────────────────────────────────────
   Session helpers (persist login across page refresh)
─────────────────────────────────────────────────────── */
export function saveSession(user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {}
}

export function loadSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate it still corresponds to a registered user
    if (parsed?.uid && parsed?.email && parsed?.provider) {
      const stillExists = getRegisteredUsers().some(u => u.uid === parsed.uid);
      return stillExists ? (parsed as AuthUser) : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

/* ──────────────────────────────────────────────────────
   Email validation (strict format: user@domain.tld)
─────────────────────────────────────────────────────── */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!re.test(normalized)) return false;
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 255 || !domain.includes('.')) return false;
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return false;
  return true;
}

/* ──────────────────────────────────────────────────────
   Register a new email account (strict — blocks duplicates)
─────────────────────────────────────────────────────── */
export function registerAccount(name: string, email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    throw new Error('Please enter a valid, complete email address (e.g. user@gmail.com).');
  }
  if (!name.trim() || name.trim().length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const existing = findUserByEmail(normalized);
  if (existing) {
    throw new Error(
      `An account with the email "${normalized}" already exists. Please sign in instead.`
    );
  }

  const newAccount: RegisteredAccount = {
    uid: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: normalized,
    passwordHash: password,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  const users = getRegisteredUsers();
  users.push(newAccount);
  saveRegisteredUsers(users);

  const authUser: AuthUser = {
    uid: newAccount.uid,
    name: newAccount.name,
    email: newAccount.email,
    provider: 'email',
  };
  saveSession(authUser);
  return authUser;
}

/* ──────────────────────────────────────────────────────
   Email Login — strict password check, no bypass
─────────────────────────────────────────────────────── */
export function verifyAndLogin(email: string, password: string): AuthUser {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    throw new Error('Please enter a valid, complete email address (e.g. user@gmail.com).');
  }

  const user = findUserByEmail(normalized);

  if (!user) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }

  // Block login if password is wrong — no bypass allowed
  if (!user.passwordHash) {
    throw new Error(
      'This account was registered using a social provider (Google/Apple/LinkedIn). Please sign in using that method.'
    );
  }

  if (user.passwordHash !== password) {
    throw new Error('Incorrect password. Please check your credentials and try again.');
  }

  const authUser: AuthUser = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
  };
  saveSession(authUser);
  return authUser;
}

/* ──────────────────────────────────────────────────────
   Social Login — requires real user-supplied email & name.
   The user must supply their actual Apple ID, Google, or LinkedIn email.
   If no account exists for that email/provider, one is created.
   If an account exists but was created via a different provider,
   it throws an error.
─────────────────────────────────────────────────────── */
export function socialLogin(
  provider: 'google' | 'apple' | 'linkedin',
  email: string,
  name: string
): AuthUser {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    throw new Error('Please enter a valid, complete email address (e.g. yourname@gmail.com).');
  }
  if (!name.trim() || name.trim().length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }

  const existing = findUserByEmail(normalized);

  if (existing) {
    // Account found — verify it belongs to the same provider
    if (existing.provider !== provider && existing.provider !== 'email') {
      throw new Error(
        `This email is already registered with ${existing.provider}. Please use ${existing.provider} to sign in.`
      );
    }
    // Allow sign-in
    const authUser: AuthUser = {
      uid: existing.uid,
      name: existing.name,
      email: existing.email,
      avatarUrl: existing.avatarUrl,
      provider: existing.provider,
    };
    saveSession(authUser);
    return authUser;
  }

  // No existing account — create one linked to this social provider
  const newAccount: RegisteredAccount = {
    uid: `${provider}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    email: normalized,
    passwordHash: '', // no password for social accounts
    provider,
    createdAt: new Date().toISOString(),
  };

  const users = getRegisteredUsers();
  users.push(newAccount);
  saveRegisteredUsers(users);

  const authUser: AuthUser = {
    uid: newAccount.uid,
    name: newAccount.name,
    email: newAccount.email,
    provider,
  };
  saveSession(authUser);
  return authUser;
}

/* ──────────────────────────────────────────────────────
   Change Password — verifies current password, then updates
─────────────────────────────────────────────────────── */
export function changePassword(uid: string, currentPassword: string, newPassword: string): void {
  const users = getRegisteredUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx === -1) throw new Error('Account not found.');

  const user = users[idx];
  if (!user.passwordHash) {
    throw new Error('This account uses social sign-in. Password cannot be changed here.');
  }
  if (user.passwordHash !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from the current password.');
  }

  users[idx] = { ...user, passwordHash: newPassword };
  saveRegisteredUsers(users);
}

/* ──────────────────────────────────────────────────────
   Delete account
─────────────────────────────────────────────────────── */
export function deleteAccount(uid: string): void {
  const users = getRegisteredUsers().filter(u => u.uid !== uid);
  saveRegisteredUsers(users);
  clearSession();
}
