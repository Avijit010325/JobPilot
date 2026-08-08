import { useState, useCallback, useEffect } from 'react';
import { LayoutDashboard, Briefcase, FileCheck, Sparkles, User } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './components/DashboardPage';
import { JobsPage } from './components/JobsPage';
import { ApplicationsPage } from './components/ApplicationsPage';
import { GeneratorPage } from './components/GeneratorPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { AddJobModal } from './components/AddJobModal';
import { ApplicationEditor } from './components/ApplicationEditor';
import { AuthPage } from './components/AuthPage';
import { ChatBot } from './components/ChatBot';

import { seedProfile, seedJobs, seedApplications, seedActivity } from './lib/data';
import { computeNeedsFollowUp } from './lib/ai';
import type { AuthUser } from './lib/auth';
import { loadSession, clearSession, saveSession } from './lib/auth';
import type {
  NavPage, CandidateProfile, JobListing, JobApplication,
  AppStatus, ActivityEntry, AppNotification,
} from './types';

/* ── Seed notifications ── */
const seedNotifications: AppNotification[] = [
  { id: 'n1', type: 'follow_up', title: 'Follow-up needed', body: 'Your Stripe application is 11 days old with no response. Time to reach out!', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
  { id: 'n2', type: 'status', title: 'Application status updated', body: 'Spotify — Senior Frontend Engineer moved to Interviewing 🎉', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), read: false },
  { id: 'n3', type: 'match', title: 'New high-match job added', body: 'Figma — Senior Engineer: Plugin Ecosystem is a 91% match with your profile.', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
  { id: 'n4', type: 'info', title: 'AI materials generated', body: 'Cover letter and resume bullets generated for Vercel — Next.js Core Engineer.', timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), read: true },
];

export default function App() {
  /* ── Auth — starts strictly at the Login Page; authentication is required to access the app ── */
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const handleAuth = useCallback((user: AuthUser) => {
    saveSession(user);
    setAuthUser(user);
  }, []);

  const handleSignOut = useCallback(() => {
    clearSession();
    setAuthUser(null);
    // Reset app data so it doesn't leak between accounts
    setActivePage('dashboard');
    setProfile(seedProfile);
    setJobs(seedJobs);
    setApplications(seedApplications);
    setActivity(seedActivity);
    setNotifications(seedNotifications);
  }, []);

  /* ── Theme ── */
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  const onToggleTheme = useCallback(() => setIsDark(v => !v), []);

  /* ── Sync profile name/email from authenticated user ── */
  useEffect(() => {
    if (authUser) {
      setProfile(prev => ({
        ...prev,
        name: prev.name === seedProfile.name ? authUser.name : prev.name,
        email: prev.email === seedProfile.email ? authUser.email : prev.email,
      }));
    }
  }, [authUser?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── App state ── */
  const [activePage, setActivePage]       = useState<NavPage>('dashboard');
  const [profile, setProfile]             = useState<CandidateProfile>(seedProfile);
  const [jobs, setJobs]                   = useState<JobListing[]>(seedJobs);
  const [applications, setApplications]   = useState<JobApplication[]>(seedApplications);
  const [activity, setActivity]           = useState<ActivityEntry[]>(seedActivity);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);

  /* ── Modal state ── */
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [editorJob, setEditorJob]   = useState<JobListing | null>(null);
  const [editorApp, setEditorApp]   = useState<JobApplication | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  /* ── ALL useCallback hooks (before auth gate — Rules of Hooks) ── */
  const addEntry = useCallback((partial: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    setActivity(prev => [
      { ...partial, id: `act_${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const pushNotif = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      { ...n, id: `notif_${Date.now()}`, timestamp: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const openEditor = useCallback((job: JobListing) => {
    setApplications(prev => {
      setEditorApp(prev.find(a => a.jobId === job.jobId) ?? null);
      return prev;
    });
    setEditorJob(job);
    setEditorOpen(true);
  }, []);

  const handleSaveJob = useCallback((job: JobListing) => {
    setJobs(prev => [job, ...prev]);
    addEntry({ type: 'job_added', company: job.company, role: job.title, detail: `New job added — ${job.matchScore}% AI match` });
    pushNotif({ type: 'match', title: 'New job added', body: `${job.company} — ${job.title} (${job.matchScore}% match)` });
    setAddJobOpen(false);
    setEditorJob(job);
    setEditorApp(null);
    setEditorOpen(true);
  }, [addEntry, pushNotif]);

  const handleSaveApp = useCallback((app: JobApplication) => {
    setApplications(prev => {
      const idx = prev.findIndex(a => a.applicationId === app.applicationId);
      if (idx >= 0) { const next = [...prev]; next[idx] = app; return next; }
      return [app, ...prev];
    });
    if (app.status === 'applied') {
      addEntry({ type: 'applied', company: app.company, role: app.role, detail: 'Application submitted' });
      pushNotif({ type: 'info', title: 'Application submitted', body: `${app.company} — ${app.role}` });
    }
    setEditorOpen(false);
  }, [addEntry, pushNotif]);

  const handleUpdateStatus = useCallback((appId: string, status: AppStatus) => {
    const now = new Date().toISOString();

    setApplications(prev => prev.map(a => {
      if (a.applicationId !== appId) return a;
      const updated: JobApplication = {
        ...a,
        status,
        appliedAt: status === 'applied' && !a.appliedAt ? now : (status === 'draft' ? null : (a.appliedAt || now)),
        updatedAt: now,
      };
      updated.needsFollowUp = computeNeedsFollowUp(updated);
      return updated;
    }));

    setApplications(prev => {
      const app = prev.find(a => a.applicationId === appId);
      if (app) {
        const friendlyStatus = status === 'offered' ? 'Offer Received' : status;
        addEntry({
          type: 'status_change',
          company: app.company,
          role: app.role,
          detail: `Status changed to ${friendlyStatus}`
        });
        pushNotif({
          type: 'status',
          title: 'Status Updated',
          body: `${app.company} (${app.role}) moved to ${friendlyStatus}`
        });
      }
      return prev;
    });
  }, [addEntry, pushNotif]);

  const handleSelectApp = useCallback((app: JobApplication) => {
    setJobs(prev => {
      const job = prev.find(j => j.jobId === app.jobId) ?? null;
      if (job) {
        setEditorJob(job);
        setEditorApp(app);
        setEditorOpen(true);
      }
      return prev;
    });
  }, []);

  const handleSaveProfile = useCallback((updated: CandidateProfile) => setProfile(updated), []);

  const onMarkAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const onDismissNotif = useCallback((id: string) => setNotifications(prev => prev.filter(n => n.id !== id)), []);

  /* ── Auth gate — after all hooks ── */
  if (!authUser) {
    return <AuthPage onAuth={handleAuth} />;
  }

  /* ── Derived ── */
  const followUpCount = applications.filter(a => a.needsFollowUp).length;
  const draftCount    = applications.filter(a => a.status === 'draft').length;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} followUpCount={followUpCount} draftCount={draftCount} />

      <main className="page-content">
        <TopBar
          profile={profile}
          activePage={activePage}
          followUpCount={followUpCount}
          notifications={notifications}
          onAddJob={() => setAddJobOpen(true)}
          onSignOut={handleSignOut}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
          onNavigate={setActivePage}
          onMarkAllRead={onMarkAllRead}
          onDismissNotif={onDismissNotif}
        />

        {activePage === 'dashboard' && (
          <DashboardPage
            jobs={jobs} applications={applications} activity={activity}
            onSelectJob={openEditor} onSelectApp={handleSelectApp}
            onGenerateFor={openEditor} onNavigate={page => setActivePage(page)}
          />
        )}
        {activePage === 'jobs' && (
          <JobsPage
            jobs={jobs} applications={applications}
            onAddJob={() => setAddJobOpen(true)} onGenerateFor={openEditor}
          />
        )}
        {activePage === 'applications' && (
          <ApplicationsPage
            applications={applications} onSelectApp={handleSelectApp} onUpdateStatus={handleUpdateStatus}
          />
        )}
        {activePage === 'generator' && (
          <GeneratorPage profile={profile} jobs={jobs} onGenerateFor={openEditor} />
        )}
        {activePage === 'profile' && (
          <ProfilePage profile={profile} onSave={handleSaveProfile} />
        )}
        {activePage === 'settings' && (
          <SettingsPage isDark={isDark} onToggleTheme={onToggleTheme} onSignOut={handleSignOut} authUser={authUser} />
        )}
      </main>

      {/* Global Modals */}
      {addJobOpen && (
        <AddJobModal profile={profile} onSave={handleSaveJob} onClose={() => setAddJobOpen(false)} />
      )}
      {editorOpen && editorJob && (
        <ApplicationEditor
          job={editorJob} existingApp={editorApp} profile={profile}
          onSave={handleSaveApp} onClose={() => setEditorOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        {([
          { id: 'dashboard' as const, label: 'Home', icon: <LayoutDashboard size={20} /> },
          { id: 'jobs' as const, label: 'Jobs', icon: <Briefcase size={20} /> },
          { id: 'applications' as const, label: 'Apps', icon: <FileCheck size={20} />, badge: followUpCount + draftCount },
          { id: 'generator' as const, label: 'AI', icon: <Sparkles size={20} /> },
          { id: 'profile' as const, label: 'Profile', icon: <User size={20} /> },
        ] as const).map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            style={{ position: 'relative' }}
          >
            {item.icon}
            {'badge' in item && (item as { badge?: number }).badge && (item as { badge?: number }).badge! > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 6,
                minWidth: 14, height: 14, borderRadius: 7,
                background: 'var(--magenta)', color: '#fff',
                fontSize: '0.55rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 2px',
              }}>{(item as { badge?: number }).badge}</span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* AI Chatbot — always mounted */}
      <ChatBot />
    </div>
  );
}
