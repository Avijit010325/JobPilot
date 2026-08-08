import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, LogOut, Sun, Moon, CheckCheck, X, AlertTriangle, Activity, Briefcase, FileCheck } from 'lucide-react';
import type { CandidateProfile, NavPage, AppNotification } from '../types';

interface TopBarProps {
  profile: CandidateProfile;
  activePage: NavPage;
  followUpCount: number;
  notifications: AppNotification[];
  onAddJob: () => void;
  onSignOut: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: NavPage) => void;
  onMarkAllRead: () => void;
  onDismissNotif: (id: string) => void;
}

const PAGE_LABELS: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Your job search overview, all in one place.' },
  jobs:         { title: 'Target Jobs',  subtitle: 'Manage and rank your job opportunities.' },
  applications: { title: 'Applications', subtitle: 'Track every application and follow-up.' },
  generator:    { title: 'AI Generator', subtitle: 'Generate tailored resumes, cover letters, and outreach.' },
  profile:      { title: 'My Profile',   subtitle: 'Your candidate profile used to match and generate.' },
  settings:     { title: 'Settings',     subtitle: 'Preferences and account configuration.' },
};

const NOTIF_ICONS: Record<AppNotification['type'], React.ReactNode> = {
  follow_up: <AlertTriangle size={14} color="var(--amber)"/>,
  status:    <Activity size={14} color="var(--purple)"/>,
  match:     <Briefcase size={14} color="var(--sky)"/>,
  info:      <FileCheck size={14} color="var(--blue)"/>,
};

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile, activePage, notifications,
  onAddJob, onSignOut, isDark, onToggleTheme, onNavigate,
  onMarkAllRead, onDismissNotif,
}) => {
  const page = PAGE_LABELS[activePage];
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, gap:16, flexWrap:'wrap' }}>
      {/* Page Title */}
      <div>
        <h1 className="page-title">
          {activePage === 'dashboard'
            ? <>Welcome back, <span style={{ color:'var(--magenta)' }}>{profile.name.split(' ')[0]}</span></>
            : page.title}
        </h1>
        <p className="page-subtitle">{page.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>

        {(activePage === 'dashboard' || activePage === 'jobs') && (
          <button className="btn btn-primary btn-sm" onClick={onAddJob} id="add-job-btn">
            <Plus size={16}/> Add Job
          </button>
        )}

        {/* Theme toggle */}
        <div className="tooltip-wrapper">
          <button
            className="btn-icon"
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ borderRadius:12, background:'var(--bg-card-raised)', border:'1px solid var(--border)', color: isDark ? 'var(--amber)' : 'var(--indigo)' }}
          >
            {isDark ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
          <span className="tooltip">{isDark ? 'Light mode' : 'Dark mode'}</span>
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position:'relative' }}>
          <button
            className="btn-icon"
            style={{ position:'relative' }}
            aria-label="Notifications"
            onClick={() => setShowNotif(v => !v)}
            id="notif-bell-btn"
          >
            <Bell size={17}/>
            {unread > 0 && (
              <span style={{ position:'absolute', top:5, right:5, minWidth:16, height:16, borderRadius:8, background:'var(--magenta)', border:'2px solid var(--bg-surface)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontWeight:800, color:'#fff', padding:'0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {showNotif && (
            <div style={{ position:'absolute', top:'calc(100% + 12px)', right:0, width:340, background:'var(--bg-card-raised)', border:'1px solid var(--border-medium)', borderRadius:18, zIndex:60, boxShadow:'0 20px 60px rgba(0,0,0,0.4)', overflow:'hidden', animation:'slideUp 0.18s ease' }}>
              {/* Panel header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 12px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-primary)' }}>
                  Notifications {unread > 0 && <span style={{ fontSize:'0.72rem', background:'var(--gradient-main)', color:'#fff', borderRadius:6, padding:'2px 7px', marginLeft:6, fontWeight:700 }}>{unread} new</span>}
                </div>
                {unread > 0 && (
                  <button onClick={onMarkAllRead} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:'var(--purple)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', padding:0 }}>
                    <CheckCheck size={13}/> Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div style={{ maxHeight:320, overflowY:'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding:'32px 18px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.82rem' }}>
                    🎉 You're all caught up!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ display:'flex', gap:12, padding:'12px 18px', borderBottom:'1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(168,85,247,0.04)', transition:'background 0.15s', position:'relative' }}>
                      <div style={{ width:32, height:32, borderRadius:9, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                        {NOTIF_ICONS[n.type]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.82rem', fontWeight: n.read ? 500 : 700, color:'var(--text-primary)', marginBottom:2 }}>{n.title}</div>
                        <div style={{ fontSize:'0.76rem', color:'var(--text-muted)', lineHeight:1.4 }}>{n.body}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-disabled)', marginTop:5 }}>{timeAgo(n.timestamp)}</div>
                      </div>
                      <button onClick={() => onDismissNotif(n.id)} style={{ position:'absolute', top:10, right:12, background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:0, display:'flex', lineHeight:1, opacity:0.6 }}>
                        <X size={13}/>
                      </button>
                      {!n.read && <div style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background:'var(--magenta)' }}/>}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{ padding:'10px 18px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
                  <button onClick={() => { onNavigate('applications'); setShowNotif(false); }} style={{ background:'none', border:'none', color:'var(--purple)', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>
                    View all applications →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile pill — clickable → My Profile */}
        <div
          className="tooltip-wrapper"
          style={{ position:'relative' }}
        >
          <button
            onClick={() => onNavigate('profile')}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 14px 6px 6px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-full)', cursor:'pointer', transition:'border-color 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-glow)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(168,85,247,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
            aria-label="Go to profile"
            id="profile-pill-btn"
          >
            <img
              src={profile.avatarUrl || '/default-avatar.png'}
              alt={profile.name}
              style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
              onError={e => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
            />
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-primary)' }}>{profile.name}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{profile.title}</div>
            </div>
          </button>
          <span className="tooltip">My Profile</span>
        </div>

        {/* Sign Out */}
        <div className="tooltip-wrapper">
          <button className="btn-icon btn-ghost" onClick={onSignOut} aria-label="Sign out" id="sign-out-btn" style={{ borderRadius:12 }}>
            <LogOut size={16}/>
          </button>
          <span className="tooltip">Sign out</span>
        </div>
      </div>
    </header>
  );
};
