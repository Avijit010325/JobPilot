import React from 'react';
import type { JobListing, JobApplication, ActivityEntry } from '../types';
import { timeAgo } from '../lib/ai';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Briefcase,
  FileCheck, Sparkles, ChevronRight, ArrowUpRight, Clock, Activity
} from 'lucide-react';

interface DashboardPageProps {
  jobs: JobListing[];
  applications: JobApplication[];
  activity: ActivityEntry[];
  onSelectJob: (job: JobListing) => void;
  onSelectApp: (app: JobApplication) => void;
  onGenerateFor: (job: JobListing) => void;
  onNavigate: (page: 'jobs' | 'applications' | 'generator') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  jobs, applications, activity, onSelectJob, onSelectApp, onNavigate
}) => {
  const applied     = applications.filter(a => a.status !== 'draft');
  const followUps   = applications.filter(a => a.needsFollowUp);
  const interviews  = applications.filter(a => a.status === 'interviewing');
  const avgMatch    = jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length) : 0;

  const statusColor: Record<string, string> = {
    draft: 'badge-amber', applied: 'badge-blue', responded: 'badge-sky',
    interviewing: 'badge-purple', offered: 'badge-green', rejected: 'badge-red',
  };
  const statusLabel: Record<string, string> = {
    draft: 'Draft', applied: 'Applied', responded: 'Responded',
    interviewing: 'Interviewing', offered: 'Offer Received', rejected: 'Rejected',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── STAT ROW ── */}
      <div className="grid-3" style={{ gap: 16 }}>
        {/* Total Applied */}
        <div className="card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-subtle)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={20} color="var(--purple)" />
            </div>
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="glow-dot" style={{ width: 6, height: 6 }} /> Active
            </span>
          </div>
          <div className="stat-value">{applied.length}</div>
          <div className="stat-label">Applications Submitted</div>
          <div className="stat-delta positive"><TrendingUp size={12} /> +3 this week</div>
        </div>

        {/* Follow-ups Needed */}
        <div className="card stat-card" style={{ borderColor: followUps.length > 0 ? 'var(--amber-border)' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="var(--amber)" />
            </div>
            {followUps.length > 0 && <span className="badge badge-amber">Action needed</span>}
          </div>
          <div className="stat-value" style={{ color: followUps.length > 0 ? 'var(--amber)' : undefined }}>
            {followUps.length}
          </div>
          <div className="stat-label">Need Follow-up</div>
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Applied {'>'} 7 days ago</div>
        </div>

        {/* Interviews */}
        <div className="card stat-card" style={{ borderColor: interviews.length > 0 ? 'var(--border-glow)' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-subtle)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="var(--green)" />
            </div>
            {interviews.length > 0 && <span className="badge badge-green">In progress</span>}
          </div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{interviews.length}</div>
          <div className="stat-label">Interviews Active</div>
          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg match: {avgMatch}%</div>
        </div>
      </div>

      {/* ── MIDDLE ROW: Top Jobs + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 20 }}>

        {/* Top Matched Jobs */}
        <div className="card" style={{ padding: 22 }}>
          <div className="section-header">
            <span className="section-title">Top Matched Jobs</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('jobs')} style={{ gap: 4, fontSize: '0.78rem' }}>
              See all <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.slice(0, 4).map(job => (
              <div
                key={job.jobId}
                className="card-interactive"
                onClick={() => onSelectJob(job)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 14,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  transition: 'all 0.18s',
                }}
              >
                {/* Logo */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, flexShrink: 0 }}>
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                    : <Briefcase size={18} color="var(--text-muted)" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</span>
                    <span className={`badge ${job.locationType === 'remote' ? 'badge-green' : 'badge-sky'}`} style={{ flexShrink: 0 }}>{job.locationType}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                </div>

                {/* Match Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: job.matchScore >= 88 ? 'var(--green)' : job.matchScore >= 75 ? 'var(--indigo)' : 'var(--amber)', fontFamily: 'var(--font-display)' }}>
                    {job.matchScore}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>match</div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="empty-state" style={{ padding: '32px 12px' }}>
                <div className="empty-icon"><Briefcase size={22} /></div>
                <div className="empty-title">No jobs yet</div>
                <div className="empty-body">Add your first target job to see AI match scores.</div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed + Applications Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Applications Summary */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <span className="section-title">My Applications</span>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('applications')} style={{ gap: 4, fontSize: '0.78rem' }}>
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {applications.slice(0, 3).map(app => (
                <div
                  key={app.applicationId}
                  className="card-interactive"
                  onClick={() => onSelectApp(app)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', transition: 'all 0.18s' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{app.company}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge ${statusColor[app.status]}`}>{statusLabel[app.status]}</span>
                    {app.appliedAt && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10}/> {timeAgo(app.appliedAt)}</span>}
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No applications yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <span className="section-title">Recent Activity</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activity.slice(0, 4).map(entry => (
                <div key={entry.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {entry.type === 'applied' && <FileCheck size={13} color="var(--blue)" />}
                    {entry.type === 'status_change' && <Activity size={13} color="var(--purple)" />}
                    {entry.type === 'follow_up' && <AlertTriangle size={13} color="var(--amber)" />}
                    {entry.type === 'job_added' && <Briefcase size={13} color="var(--sky)" />}
                    {(entry.type === 'generated') && <Sparkles size={13} color="var(--green)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>
                      <span style={{ color: 'var(--magenta)', fontWeight: 700 }}>{entry.company}</span> · {entry.detail}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(entry.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── AI BANNER ── */}
      <div className="ai-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="ai-banner-title">
            <Sparkles size={20} color="var(--magenta)" />
            <span>Decisions Powered by AI</span>
          </div>
          <p className="ai-banner-desc" style={{ maxWidth: 520 }}>
            Select any target job to instantly generate a tailored resume, cover letter, and personalized recruiter outreach — all personalized to your profile.
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => onNavigate('generator')} id="explore-ai-btn" style={{ gap: 8 }}>
          <Sparkles size={17} /> Explore AI Generator
        </button>
      </div>
    </div>
  );
};
