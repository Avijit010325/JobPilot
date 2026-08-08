import React, { useState } from 'react';
import {
  Lock, Trash2, Bell, Moon, Shield, CheckCircle2,
  Eye, EyeOff, AlertTriangle, Sun, ChevronRight
} from 'lucide-react';
import type { AuthUser } from '../lib/auth';
import { changePassword, deleteAccount } from '../lib/auth';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onSignOut: () => void;
  authUser: AuthUser;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isDark, onToggleTheme, onSignOut, authUser }) => {
  /* ── Change Password ── */
  const [pwCurrent, setPwCurrent]   = useState('');
  const [pwNew, setPwNew]           = useState('');
  const [pwRepeat, setPwRepeat]     = useState('');
  const [showCur, setShowCur]       = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showRep, setShowRep]       = useState(false);
  const [pwError, setPwError]       = useState('');
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [pwLoading, setPwLoading]   = useState(false);

  /* ── Delete Account ── */
  const [deleteInput, setDeleteInput]   = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Notification prefs ── */
  const [notifFollowUp, setNotifFollowUp] = useState(true);
  const [notifStatus, setNotifStatus]     = useState(true);
  const [notifMatch, setNotifMatch]       = useState(false);

  const isSocialAccount = authUser.provider !== 'email';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (isSocialAccount) {
      setPwError(`You signed in with ${authUser.provider}. Password management is handled by that provider.`);
      return;
    }
    if (!pwCurrent.trim()) { setPwError('Please enter your current password.'); return; }
    if (pwNew.length < 8)   { setPwError('New password must be at least 8 characters.'); return; }
    if (pwNew !== pwRepeat) { setPwError('New passwords do not match.'); return; }

    setPwLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      changePassword(authUser.uid, pwCurrent, pwNew);
      setPwLoading(false);
      setPwSuccess(true);
      setPwCurrent(''); setPwNew(''); setPwRepeat('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwLoading(false);
      setPwError(err instanceof Error ? err.message : 'Password change failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleteLoading(true);
    await new Promise(r => setTimeout(r, 800));
    deleteAccount(authUser.uid);
    setDeleteLoading(false);
    onSignOut();
  };

  const PwInput = ({ id, value, show, onToggle, onChange, placeholder }: {
    id: string; value: string; show: boolean;
    onToggle: () => void; onChange: (v: string) => void; placeholder: string;
  }) => (
    <div style={{ position:'relative' }}>
      <input id={id} className="input" type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ paddingRight:44 }} />
      <button type="button" onClick={onToggle} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
        {show ? <EyeOff size={16}/> : <Eye size={16}/>}
      </button>
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} style={{ position:'relative', width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background: checked ? 'var(--gradient-main)' : 'var(--bg-hover)', transition:'background 0.2s', flexShrink:0, padding:0 }}>
      <div style={{ position:'absolute', top:3, left: checked ? 23 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.25)', transition:'left 0.2s' }} />
    </button>
  );

  return (
    <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:24 }}>

      {/* ── Account Info Banner ── */}
      <div className="card" style={{ padding:20, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--gradient-main)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
          {authUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>{authUser.name}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>{authUser.email}</div>
          <div style={{ marginTop:4 }}>
            <span className={`badge ${authUser.provider === 'email' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize:'0.68rem' }}>
              {authUser.provider === 'email' ? '✉ Email account' : `🔗 ${authUser.provider} account`}
            </span>
          </div>
        </div>
        <div style={{ marginLeft:'auto', flexShrink:0 }}>
          <button className="btn btn-ghost btn-sm" onClick={onSignOut} style={{ gap:6, color:'var(--red)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Appearance ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isDark ? <Moon size={18} color="var(--purple)"/> : <Sun size={18} color="var(--amber)"/>}
          </div>
          <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Appearance</h2>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>Theme</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Currently using <strong>{isDark ? 'Dark' : 'Light'}</strong> mode</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onToggleTheme} style={{ gap:8 }}>
            {isDark ? <><Sun size={15}/> Switch to Light</> : <><Moon size={15}/> Switch to Dark</>}
          </button>
        </div>
      </div>

      {/* ── Notification Preferences ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bell size={18} color="var(--purple)"/>
          </div>
          <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Notifications</h2>
        </div>

        {[
          { label:'Follow-up Reminders', desc:'Alert when an application needs a follow-up', value:notifFollowUp, set:setNotifFollowUp },
          { label:'Status Changes',      desc:'Notify when application status is updated',    value:notifStatus,   set:setNotifStatus },
          { label:'New AI Match Alerts', desc:'Alert when a new job matches your profile',    value:notifMatch,    set:setNotifMatch },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div>
              <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{item.label}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <Toggle checked={item.value} onChange={() => item.set(v => !v)} />
          </div>
        ))}
      </div>

      {/* ── Change Password ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Lock size={18} color="var(--purple)"/>
          </div>
          <div>
            <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Change Password</h2>
            {isSocialAccount && (
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>
                Not available — you signed in with {authUser.provider}.
              </p>
            )}
          </div>
        </div>

        {isSocialAccount ? (
          <div style={{ padding:'14px 16px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:12, fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
            Your account is managed by <strong style={{ color:'var(--text-primary)' }}>{authUser.provider}</strong>. To change your password, please visit your {authUser.provider} account settings.
          </div>
        ) : (
          <>
            {pwError && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'var(--red-dim)', border:'1px solid var(--red-border)', borderRadius:12, color:'var(--red)', fontSize:'0.82rem', fontWeight:500, marginBottom:16 }}>
                <AlertTriangle size={15}/> {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid var(--green-border)', borderRadius:12, color:'var(--green)', fontSize:'0.82rem', fontWeight:500, marginBottom:16 }}>
                <CheckCircle2 size={15}/> Password updated successfully.
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="field">
                <label className="field-label" htmlFor="pw-current">Current Password</label>
                <PwInput id="pw-current" value={pwCurrent} show={showCur} onToggle={() => setShowCur(v => !v)} onChange={setPwCurrent} placeholder="Enter your current password" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="pw-new">New Password</label>
                <PwInput id="pw-new" value={pwNew} show={showNew} onToggle={() => setShowNew(v => !v)} onChange={setPwNew} placeholder="Min. 8 characters" />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="pw-repeat">Confirm New Password</label>
                <PwInput id="pw-repeat" value={pwRepeat} show={showRep} onToggle={() => setShowRep(v => !v)} onChange={setPwRepeat} placeholder="Repeat new password" />
              </div>

              {/* Strength bar */}
              {pwNew.length > 0 && (
                <div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:6 }}>
                    Strength: <span style={{ color: pwNew.length < 8 ? 'var(--red)' : pwNew.length < 12 ? 'var(--amber)' : 'var(--green)', fontWeight:600 }}>
                      {pwNew.length < 8 ? 'Weak' : pwNew.length < 12 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                  <div style={{ height:4, borderRadius:4, background:'var(--border)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width: `${Math.min(100, (pwNew.length / 14) * 100)}%`, borderRadius:4, background: pwNew.length < 8 ? 'var(--red)' : pwNew.length < 12 ? 'var(--amber)' : 'var(--green)', transition:'width 0.3s, background 0.3s' }} />
                  </div>
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={pwLoading} id="change-pw-btn">
                  {pwLoading ? 'Updating…' : <><Lock size={15}/> Update Password</>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* ── Security ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={18} color="var(--purple)"/>
          </div>
          <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Security</h2>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0' }}>
          <div>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>Two-Factor Authentication</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Add an extra layer of security to your account</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ gap:8 }}>
            Enable <ChevronRight size={14}/>
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card" style={{ padding:28, border:'1px solid var(--red-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--red-dim)', border:'1px solid var(--red-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Trash2 size={18} color="var(--red)"/>
          </div>
          <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--red)' }}>Danger Zone</h2>
        </div>
        <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:20, lineHeight:1.6 }}>
          Permanently delete your JobPilot account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            className="btn btn-sm"
            style={{ background:'var(--red-dim)', border:'1px solid var(--red-border)', color:'var(--red)', fontWeight:700 }}
            onClick={() => setShowDeleteConfirm(true)}
            id="delete-account-btn"
          >
            <Trash2 size={15}/> Delete My Account
          </button>
        ) : (
          <div style={{ background:'var(--bg-card-raised)', border:'1px solid var(--red-border)', borderRadius:14, padding:20 }}>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>
              ⚠️ This will permanently delete your account and all data.
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:14 }}>
              Type <strong style={{ color:'var(--red)' }}>DELETE</strong> to confirm. This cannot be undone.
            </p>
            <input
              className="input"
              placeholder="Type DELETE to confirm"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              style={{ marginBottom:12, borderColor: deleteInput === 'DELETE' ? 'var(--red)' : undefined }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button
                className="btn btn-sm"
                style={{ background:'var(--red-dim)', border:'1px solid var(--red-border)', color:'var(--red)', fontWeight:700 }}
                disabled={deleteInput !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting…' : <><Trash2 size={14}/> Permanently Delete</>}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
