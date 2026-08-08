import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidEmail,
  registerAccount,
  verifyAndLogin,
  socialLogin,
  changePassword,
  deleteAccount,
  getRegisteredUsers,
  saveRegisteredUsers,
  loadSession,
  clearSession,
} from '../lib/auth';

describe('Strict Email RFC Validator', () => {
  it('should accept valid email formats', () => {
    expect(isValidEmail('user@gmail.com')).toBe(true);
    expect(isValidEmail('sarah.connor+work@domain.co.uk')).toBe(true);
    expect(isValidEmail('alex_morgan123@sub.company.org')).toBe(true);
  });

  it('should reject invalid, incomplete, or malicious email strings', () => {
    expect(isValidEmail('@')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@gmail.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('plainaddress')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
  });
});

describe('User Registration & Duplicate Protection', () => {
  beforeEach(() => {
    saveRegisteredUsers([]);
    clearSession();
  });

  it('should successfully register a valid account and create session', () => {
    const user = registerAccount('John Doe', 'john.doe@example.com', 'securePassword123!');
    expect(user.uid).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
    expect(user.provider).toBe('email');

    // Verify session
    const session = loadSession();
    expect(session?.uid).toBe(user.uid);
    expect(session?.email).toBe('john.doe@example.com');
  });

  it('should reject duplicate email registrations', () => {
    registerAccount('John Doe', 'duplicate@example.com', 'password123');
    expect(() => {
      registerAccount('Jane Doe', 'duplicate@example.com', 'anotherPass123');
    }).toThrow(/already exists/i);
  });

  it('should reject short passwords (< 8 characters)', () => {
    expect(() => {
      registerAccount('Short Pass', 'short@example.com', '12345');
    }).toThrow(/8 characters/i);
  });

  it('should reject short or empty names', () => {
    expect(() => {
      registerAccount('a', 'valid@example.com', 'password123');
    }).toThrow(/full name/i);
  });
});

describe('Credential Verification & Login', () => {
  beforeEach(() => {
    saveRegisteredUsers([]);
    clearSession();
    registerAccount('Alice Cooper', 'alice@rock.com', 'rockHard123!');
  });

  it('should allow login with correct email and password', () => {
    const user = verifyAndLogin('alice@rock.com', 'rockHard123!');
    expect(user.name).toBe('Alice Cooper');
    expect(user.email).toBe('alice@rock.com');
  });

  it('should reject login with wrong password', () => {
    expect(() => {
      verifyAndLogin('alice@rock.com', 'wrongPassword');
    }).toThrow(/incorrect password/i);
  });

  it('should throw ACCOUNT_NOT_FOUND for unregistered email', () => {
    expect(() => {
      verifyAndLogin('nobody@nowhere.com', 'randomPass123');
    }).toThrow('ACCOUNT_NOT_FOUND');
  });
});

describe('Social Sign-In Integration', () => {
  beforeEach(() => {
    saveRegisteredUsers([]);
    clearSession();
  });

  it('should create new account when social user signs in for first time', () => {
    const user = socialLogin('google', 'google.user@gmail.com', 'Google User');
    expect(user.provider).toBe('google');
    expect(user.name).toBe('Google User');
    expect(user.email).toBe('google.user@gmail.com');

    // Verify it is saved in user registry
    const registered = getRegisteredUsers();
    expect(registered.length).toBe(1);
    expect(registered[0].provider).toBe('google');
  });

  it('should allow social login if previously registered with same social provider', () => {
    socialLogin('linkedin', 'li.user@linkedin.com', 'LinkedIn Member');
    const returning = socialLogin('linkedin', 'li.user@linkedin.com', 'LinkedIn Member');
    expect(returning.email).toBe('li.user@linkedin.com');
  });
});

describe('Password Management & Account Deletion', () => {
  beforeEach(() => {
    saveRegisteredUsers([]);
    clearSession();
  });

  it('should successfully change password when current password matches', () => {
    const user = registerAccount('Charlie', 'charlie@dev.com', 'oldPassword123');
    changePassword(user.uid, 'oldPassword123', 'newSecretPassword456');

    // Login with new password should succeed
    const logged = verifyAndLogin('charlie@dev.com', 'newSecretPassword456');
    expect(logged.uid).toBe(user.uid);
  });

  it('should reject password change with incorrect current password', () => {
    const user = registerAccount('Charlie', 'charlie2@dev.com', 'oldPassword123');
    expect(() => {
      changePassword(user.uid, 'wrongCurrent', 'newSecretPassword456');
    }).toThrow(/incorrect/i);
  });

  it('should wipe user account upon deletion', () => {
    const user = registerAccount('David', 'david@dev.com', 'password123');
    deleteAccount(user.uid);

    expect(getRegisteredUsers().find(u => u.uid === user.uid)).toBeUndefined();
    expect(() => {
      verifyAndLogin('david@dev.com', 'password123');
    }).toThrow('ACCOUNT_NOT_FOUND');
  });
});
