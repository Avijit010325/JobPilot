import React, { useState, useCallback } from 'react';
import type { AuthUser } from '../lib/auth';
import {
  registerAccount, verifyAndLogin, socialLogin
} from '../lib/auth';
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2,
  Loader2, UserPlus, ArrowRight, KeyRound, ShieldAlert, X
} from 'lucide-react';

/* ── Social Provider SVG Icons ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

type AuthMode = 'login' | 'register';
type SocialProvider = 'google' | 'apple' | 'linkedin';

interface AuthPageProps {
  onAuth: (user: AuthUser) => void;
}

/* ── Social credential step types ── */
interface SocialStep {
  provider: SocialProvider;
  socialEmail: string;
  socialName: string;
  socialError: string;
  socialLoading: boolean;
}

const SOCIAL_CONFIG: Record<SocialProvider, { label: string; icon: React.ReactNode; placeholder: string; hint: string }> = {
  google: {
    label: 'Google',
    icon: <GoogleIcon />,
    placeholder: 'yourname@gmail.com',
    hint: 'Enter the Gmail address linked to your Google account.',
  },
  apple: {
    label: 'Apple ID',
    icon: <AppleIcon />,
    placeholder: 'yourname@icloud.com or @me.com',
    hint: 'Enter the email address associated with your Apple ID.',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <LinkedInIcon />,
    placeholder: 'yourname@company.com',
    hint: 'Enter the email address you use to log in to LinkedIn.',
  },
};

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  /* Email/password form state */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdRepeat, setShowPwdRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suggestRegister, setSuggestRegister] = useState(false);

  /* Social credential step */
  const [socialStep, setSocialStep] = useState<SocialStep | null>(null);

  const clearFeedback = () => { setError(''); setSuccess(''); setSuggestRegister(false); };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    clearFeedback();
    setPassword('');
    setPasswordRepeat('');
    setName('');
    setEmail('');
    setSocialStep(null);
  };

  /* ── Email login / register ── */
  const handleEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) { setError('Please enter your full name.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
      if (password !== passwordRepeat) { setError('Passwords do not match. Please re-enter.'); return; }

      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        const user = registerAccount(name, normalizedEmail, password);
        setSuccess('Account created successfully! Signing you in…');
        await new Promise(r => setTimeout(r, 600));
        onAuth(user);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      if (!password.trim()) { setError('Please enter your password.'); return; }

      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 600));
        const user = verifyAndLogin(normalizedEmail, password);
        setSuccess(`Welcome back, ${user.name}! Redirecting…`);
        await new Promise(r => setTimeout(r, 500));
        onAuth(user);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign-in failed.';
        if (msg === 'ACCOUNT_NOT_FOUND') {
          setError(`No account found for "${normalizedEmail}". You need to register first.`);
          setSuggestRegister(true);
        } else {
          setError(msg);
        }
        setLoading(false);
      }
    }
  }, [mode, name, email, password, passwordRepeat, onAuth]);

  /* ── Open social credential step ── */
  const openSocialStep = (provider: SocialProvider) => {
    clearFeedback();
    setSocialStep({
      provider,
      socialEmail: '',
      socialName: '',
      socialError: '',
      socialLoading: false,
    });
  };

  /* ── Submit social credentials ── */
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialStep) return;

    const trimmedEmail = socialStep.socialEmail.trim().toLowerCase();
    const trimmedName = socialStep.socialName.trim();

    if (!trimmedEmail.includes('@')) {
      setSocialStep(s => s ? { ...s, socialError: 'Please enter a valid email address.' } : s);
      return;
    }
    if (!trimmedName) {
      setSocialStep(s => s ? { ...s, socialError: 'Please enter your full name.' } : s);
      return;
    }

    setSocialStep(s => s ? { ...s, socialLoading: true, socialError: '' } : s);

    try {
      await new Promise(r => setTimeout(r, 700));
      const user = socialLogin(socialStep.provider, trimmedEmail, trimmedName);
      setSocialStep(null);
      setSuccess(`Signed in as ${user.name}!`);
      await new Promise(r => setTimeout(r, 400));
      onAuth(user);
    } catch (err: unknown) {
      setSocialStep(s => s ? {
        ...s,
        socialLoading: false,
        socialError: err instanceof Error ? err.message : 'Authentication failed.',
      } : s);
    }
  };

  const isLoading = loading;

  return (
    <div className="auth-root">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      {/* ── Social Credential Modal ── */}
      {socialStep && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: 'var(--bg-card-raised)', border: '1px solid var(--border-medium)',
            borderRadius: 24, padding: '32px 28px', maxWidth: 420, width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)', animation: 'cardAppear 0.25s ease'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {SOCIAL_CONFIG[socialStep.provider].icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Continue with {SOCIAL_CONFIG[socialStep.provider].label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Verify your identity to proceed
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSocialStep(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 8 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Info banner */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
              background: 'var(--gradient-subtle)', border: '1px solid var(--border-glow)',
              borderRadius: 12, marginBottom: 20, fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              <ShieldAlert size={15} color="var(--purple)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                Enter the <strong style={{ color: 'var(--text-primary)' }}>real email and name</strong> linked to your{' '}
                {SOCIAL_CONFIG[socialStep.provider].label} account to authenticate.
              </span>
            </div>

            {/* Error */}
            {socialStep.socialError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>
                <AlertCircle size={15} /> {socialStep.socialError}
              </div>
            )}

            <form onSubmit={handleSocialSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label">Your Full Name *</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={socialStep.socialName}
                    onChange={e => setSocialStep(s => s ? { ...s, socialName: e.target.value, socialError: '' } : s)}
                    autoComplete="name"
                    disabled={socialStep.socialLoading}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  {SOCIAL_CONFIG[socialStep.provider].label} Email Address *
                </label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder={SOCIAL_CONFIG[socialStep.provider].placeholder}
                    value={socialStep.socialEmail}
                    onChange={e => setSocialStep(s => s ? { ...s, socialEmail: e.target.value, socialError: '' } : s)}
                    autoComplete="email"
                    disabled={socialStep.socialLoading}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {SOCIAL_CONFIG[socialStep.provider].hint}
                </span>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={socialStep.socialLoading}
                style={{ marginTop: 8 }}
              >
                {socialStep.socialLoading
                  ? <><Loader2 size={17} className="auth-spin" /> Verifying…</>
                  : <><CheckCircle2 size={16} /> Verify & Continue</>
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Main Auth Card ── */}
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-logo-name">JobPilot</h1>
            <p className="auth-logo-sub">AI Job Search & Outreach Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>{mode === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Enter your registered email and password to access your dashboard.'
              : 'Register with your real email to start your AI-powered job search.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 4, borderRadius: 12, marginBottom: 20 }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px 12px', border: 'none', borderRadius: 9,
                fontSize: '0.84rem', fontWeight: mode === m ? 700 : 500,
                background: mode === m ? 'var(--bg-card-raised)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create New Account'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="auth-alert auth-alert-error" style={{ flexDirection: 'column', gap: 8, alignItems: 'flex-start', display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            {suggestRegister && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => { setMode('register'); clearFeedback(); }}
                style={{ background: 'var(--amber)', color: '#000', fontWeight: 700, borderRadius: 8, width: '100%', gap: 6, justifyContent: 'center' }}
              >
                <UserPlus size={14} /> Create Account for "{email}" <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
        {success && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {/* Social Buttons */}
        <div className="auth-social">
          {(['google', 'apple', 'linkedin'] as const).map(provider => (
            <button
              key={provider}
              className={`auth-social-btn${provider === 'linkedin' ? ' auth-social-linkedin' : ''}`}
              onClick={() => openSocialStep(provider)}
              disabled={isLoading}
              aria-label={`Continue with ${SOCIAL_CONFIG[provider].label}`}
              type="button"
            >
              {SOCIAL_CONFIG[provider].icon}
              <span>{SOCIAL_CONFIG[provider].label}</span>
            </button>
          ))}
        </div>

        <div className="auth-divider">
          <span>or sign in with email & password</span>
        </div>

        {/* Email / Password Form */}
        <form className="auth-form" onSubmit={handleEmail} noValidate>
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">Full Name *</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-name"
                  className="auth-input"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Email Address *</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) clearFeedback(); }}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-label" htmlFor="auth-password">Password *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-forgot"
                  tabIndex={-1}
                  onClick={() => { clearFeedback(); setSuccess('Password reset link sent to your email (simulated).'); }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password-repeat">Confirm Password *</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="auth-password-repeat"
                  className="auth-input"
                  type={showPwdRepeat ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={passwordRepeat}
                  onChange={e => setPasswordRepeat(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPwdRepeat(v => !v)}
                  aria-label={showPwdRepeat ? 'Hide password' : 'Show password'}
                >
                  {showPwdRepeat ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
            id={mode === 'login' ? 'login-btn' : 'register-btn'}
          >
            {isLoading
              ? <><Loader2 size={18} className="auth-spin" /> {mode === 'login' ? 'Verifying…' : 'Creating Account…'}</>
              : mode === 'login'
                ? <><KeyRound size={16} /> Sign In</>
                : <><UserPlus size={16} /> Register & Sign In</>
            }
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button className="auth-toggle-link" onClick={() => switchMode('register')}>Create one here</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="auth-toggle-link" onClick={() => switchMode('login')}>Sign In</button>
            </>
          )}
        </div>

        {/* Security note */}
        <div style={{
          marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: '0.72rem', color: 'var(--text-muted)'
        }}>
          <ShieldAlert size={13} color="var(--purple)" style={{ flexShrink: 0 }} />
          Your credentials are stored securely on this device. No data is sent to any external server.
        </div>
      </div>
    </div>
  );
};
