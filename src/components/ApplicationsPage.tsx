import React, { useState } from 'react';
import type { JobApplication, AppStatus } from '../types';
import { timeAgo } from '../lib/ai';
import {
  AlertTriangle, Clock, Search, CheckCircle2, Circle, Edit3,
  MessageSquare, Award, XCircle, ArrowRight, Sparkles, Filter, Check
} from 'lucide-react';

interface ApplicationsPageProps {
  applications: JobApplication[];
  onSelectApp: (app: JobApplication) => void;
  onUpdateStatus: (appId: string, status: AppStatus) => void;
}

const STATUS_CONFIG: Record<AppStatus, { label: string; badge: string; icon: React.ReactNode; color: string; bg: string }> = {
  draft: {
    label: 'Draft',
    badge: 'badge-amber',
    icon: <Circle size={14} />,
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
  },
  applied: {
    label: 'Applied',
    badge: 'badge-blue',
    icon: <Clock size={14} />,
    color: 'var(--blue)',
    bg: 'var(--blue-dim)',
  },
  responded: {
    label: 'Responded',
    badge: 'badge-sky',
    icon: <MessageSquare size={14} />,
    color: 'var(--sky)',
    bg: 'var(--sky-dim)',
  },
  interviewing: {
    label: 'Interviewing',
    badge: 'badge-purple',
    icon: <Sparkles size={14} />,
    color: 'var(--purple)',
    bg: 'var(--gradient-subtle)',
  },
  offered: {
    label: 'Offer Received',
    badge: 'badge-green',
    icon: <Award size={14} />,
    color: 'var(--green)',
    bg: 'var(--green-dim)',
  },
  rejected: {
    label: 'Rejected',
    badge: 'badge-red',
    icon: <XCircle size={14} />,
    color: 'var(--red)',
    bg: 'var(--red-dim)',
  },
};

const STAGES: { status: AppStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'applied', label: 'Applied' },
  { status: 'responded', label: 'Responded' },
  { status: 'interviewing', label: 'Interviewing' },
  { status: 'offered', label: 'Offer' },
];

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  applications, onSelectApp, onUpdateStatus
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all');
  const [statusChangeToast, setStatusChangeToast] = useState<{ id: string; status: AppStatus } | null>(null);

  const handleStatusClick = (appId: string, newStatus: AppStatus) => {
    onUpdateStatus(appId, newStatus);
    setStatusChangeToast({ id: appId, status: newStatus });
    setTimeout(() => setStatusChangeToast(null), 2500);
  };

  const filtered = applications
    .filter(a => {
      const q = search.toLowerCase();
      const matchesSearch = !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || (a.notes && a.notes.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const followUpCount = applications.filter(a => a.needsFollowUp).length;

  // Live count per status
  const counts = {
    all: applications.length,
    draft: applications.filter(a => a.status === 'draft').length,
    applied: applications.filter(a => a.status === 'applied').length,
    responded: applications.filter(a => a.status === 'responded').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Follow-up alert banner */}
      {followUpCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          background: 'var(--amber-dim)', border: '1px solid var(--amber-border)',
          borderRadius: 14
        }}>
          <AlertTriangle size={18} color="var(--amber)" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: 'var(--amber)', fontSize: '0.875rem' }}>
              {followUpCount} application{followUpCount > 1 ? 's' : ''} need{followUpCount === 1 ? 's' : ''} a follow-up
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
              These have been in "Applied" status for 7+ days with no response recorded.
            </span>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--amber)', color: '#000', fontWeight: 700, borderRadius: 9999 }}
            onClick={() => setStatusFilter('applied')}
          >
            View Pending
          </button>
        </div>
      )}

      {/* Toolbar: Search + Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            style={{ width: '100%', maxWidth: '100%' }}
            type="text"
            placeholder="Search by company, role, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="tabs" style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }}>
          <button
            className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <Filter size={13} style={{ marginRight: 4 }} />
            All ({counts.all})
          </button>
          {(Object.keys(STATUS_CONFIG) as AppStatus[]).map(s => (
            <button
              key={s}
              className={`tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_CONFIG[s].label} ({counts[s]})
              {s === 'applied' && followUpCount > 0 && (
                <span style={{ marginLeft: 4, color: 'var(--amber)', fontWeight: 800 }}>•</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Count & Status Change Toast */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </div>
        {statusChangeToast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600,
            background: 'var(--green-dim)', border: '1px solid var(--green-border)',
            padding: '4px 12px', borderRadius: 9999, animation: 'slideUp 0.2s ease'
          }}>
            <Check size={13} /> Status updated to {STATUS_CONFIG[statusChangeToast.status].label}
          </div>
        )}
      </div>

      {/* Applications List */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(app => {
            const currentCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
            const currentStageIndex = STAGES.findIndex(st => st.status === app.status);

            return (
              <div
                key={app.applicationId}
                className="card card-hover"
                style={{ padding: '20px 24px', transition: 'all 0.2s', position: 'relative' }}
              >
                {/* Header Row: Company, Logo, Current Status Dropdown, Edit CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 200, flex: 1 }}>
                    {/* Company Logo */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'var(--bg-card-raised)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 6, flexShrink: 0, overflow: 'hidden'
                    }}>
                      {app.companyLogo ? (
                        <img
                          src={app.companyLogo}
                          alt={app.company}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--magenta)' }}>{app.company[0]}</span>
                      )}
                    </div>

                    {/* Role & Company Details */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{app.company}</span>
                        {app.needsFollowUp && (
                          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} /> Follow-up needed
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.role}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown + Edit Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {/* Direct Status Selector */}
                    <div style={{ position: 'relative' }}>
                      <select
                        className="select input"
                        value={app.status}
                        onChange={e => handleStatusClick(app.applicationId, e.target.value as AppStatus)}
                        style={{
                          height: 36,
                          padding: '4px 32px 4px 12px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: 10,
                          color: currentCfg.color,
                          background: currentCfg.bg,
                          border: `1px solid ${currentCfg.color}40`,
                          cursor: 'pointer',
                        }}
                      >
                        {(Object.keys(STATUS_CONFIG) as AppStatus[]).map(s => (
                          <option key={s} value={s} style={{ color: 'var(--text-primary)', background: 'var(--bg-card-raised)' }}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectApp(app)}
                      style={{ gap: 6, padding: '7px 12px' }}
                    >
                      <Edit3 size={13} /> Edit Materials
                    </button>
                  </div>
                </div>

                {/* Interactive Stage Stepper / Progress Bar */}
                {app.status !== 'rejected' ? (
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, position: 'relative' }}>
                      {STAGES.map((st, idx) => {
                        const isCompleted = currentStageIndex >= idx;
                        const isCurrent = app.status === st.status;

                        return (
                          <button
                            key={st.status}
                            type="button"
                            onClick={() => handleStatusClick(app.applicationId, st.status)}
                            title={`Click to set status to ${st.label}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              background: isCurrent ? 'var(--gradient-subtle)' : isCompleted ? 'rgba(255,255,255,0.04)' : 'transparent',
                              border: isCurrent ? '1px solid var(--border-glow)' : '1px solid transparent',
                              borderRadius: 8,
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: isCurrent ? 'var(--magenta)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: isCurrent ? 800 : isCompleted ? 600 : 400,
                              transition: 'all 0.15s',
                              flex: 1,
                              justifyContent: 'center',
                            }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%',
                              background: isCurrent ? 'var(--gradient-main)' : isCompleted ? 'var(--purple)' : 'var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.65rem', flexShrink: 0
                            }}>
                              {isCompleted ? <Check size={10} /> : idx + 1}
                            </div>
                            <span style={{ whiteSpace: 'nowrap' }}>{st.label}</span>
                            {idx < STAGES.length - 1 && (
                              <ArrowRight size={10} style={{ opacity: 0.3, marginLeft: 'auto' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: '0.78rem', color: 'var(--red)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={14} /> Application marked as Rejected
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleStatusClick(app.applicationId, 'applied')}
                      style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                    >
                      Re-open / Move to Applied
                    </button>
                  </div>
                )}

                {/* Footer notes and dates */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {app.appliedAt ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> Applied {timeAgo(app.appliedAt)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--amber)' }}>Not submitted yet (Draft)</span>
                    )}
                    {app.notes && (
                      <span style={{ color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📝 {app.notes}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Quick Action Buttons */}
                    {app.status === 'draft' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: '0.72rem', padding: '0 10px' }}
                        onClick={() => handleStatusClick(app.applicationId, 'applied')}
                      >
                        <CheckCircle2 size={12} /> Mark Applied
                      </button>
                    )}
                    {app.status === 'applied' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: 26, fontSize: '0.72rem', padding: '0 10px', color: 'var(--sky)' }}
                        onClick={() => handleStatusClick(app.applicationId, 'responded')}
                      >
                        <MessageSquare size={12} /> Got Response
                      </button>
                    )}
                    {app.status === 'responded' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: '0.72rem', padding: '0 10px' }}
                        onClick={() => handleStatusClick(app.applicationId, 'interviewing')}
                      >
                        <Sparkles size={12} /> Start Interview
                      </button>
                    )}
                    {app.status === 'interviewing' && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ height: 26, fontSize: '0.72rem', padding: '0 10px', background: 'var(--green)', borderColor: 'var(--green)' }}
                        onClick={() => handleStatusClick(app.applicationId, 'offered')}
                      >
                        <Award size={12} /> Got Offer 🎉
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><CheckCircle2 size={24} /></div>
          <div className="empty-title">{search ? 'No matching applications' : 'No applications found'}</div>
          <div className="empty-body">
            {search
              ? 'Try a different search keyword or status filter.'
              : 'Generate an application from the Target Jobs page to start tracking.'}
          </div>
        </div>
      )}
    </div>
  );
};
