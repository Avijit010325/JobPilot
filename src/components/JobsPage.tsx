import React, { useState } from 'react';
import type { JobListing, JobApplication } from '../types';
import { CURRENCIES } from '../types';
import { formatSalary, timeAgo } from '../lib/ai';
import { Briefcase, Sparkles, ArrowUpRight, MapPin, DollarSign, Plus, Search } from 'lucide-react';

interface JobsPageProps {
  jobs: JobListing[];
  applications: JobApplication[];
  onAddJob: () => void;
  onGenerateFor: (job: JobListing) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  jobs, applications, onAddJob, onGenerateFor
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'remote' | 'hybrid' | 'onsite'>('all');
  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');

  const appliedJobIds = new Set(applications.map(a => a.jobId));

  const filtered = jobs
    .filter(j => {
      const q = search.toLowerCase();
      const matchesSearch = !q || j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q);
      const matchesType = filterType === 'all' || j.locationType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => sortBy === 'match' ? b.matchScore - a.matchScore : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Search */}
        <div className="search-wrap" style={{ flex: 1, minWidth: 180 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            style={{ width: '100%', maxWidth: '100%' }}
            type="text"
            placeholder="Search company or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Location Type Filter */}
        <div className="tabs">
          {(['all', 'remote', 'hybrid', 'onsite'] as const).map(t => (
            <button key={t} className={`tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          className="input"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'match' | 'recent')}
          style={{ width: 'auto', padding: '7px 14px' }}
        >
          <option value="match">Sort: Best Match</option>
          <option value="recent">Sort: Recently Added</option>
        </select>
      </div>

      {/* Job Count */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> of {jobs.length} target jobs
      </div>

      {/* Jobs Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(job => {
            const isApplied = appliedJobIds.has(job.jobId);
            const scoreClass = job.matchScore >= 88 ? 'score-high' : job.matchScore >= 75 ? 'score-mid' : 'score-low';

            return (
              <div
                key={job.jobId}
                className="card card-hover"
                style={{ padding: '20px 22px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Logo */}
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, flexShrink: 0 }}>
                    {job.companyLogo
                      ? <img src={job.companyLogo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : <Briefcase size={22} color="var(--text-muted)" />
                    }
                  </div>

                  {/* Job Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{job.company}</span>
                      <span className={`badge ${job.locationType === 'remote' ? 'badge-green' : job.locationType === 'hybrid' ? 'badge-sky' : 'badge-blue'}`}>
                        {job.locationType}
                      </span>
                      {isApplied && <span className="badge badge-purple">Applied</span>}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 500 }}>{job.title}</div>

                    {/* Meta Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} /> {job.location}
                      </span>
                      {job.salaryMin && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <DollarSign size={13} />
                          {(() => {
                            const sym = job.salaryCurrency
                              ? (CURRENCIES.find(c => c.code === job.salaryCurrency)?.symbol ?? '$')
                              : '$';
                            return `${sym}${formatSalary(job.salaryMin)}${job.salaryMax ? `–${sym}${formatSalary(job.salaryMax)}` : '+'}`;
                          })()}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Added {timeAgo(job.addedAt)}</span>
                    </div>

                    {/* Matched Skills */}
                    {job.matchedSkills.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {job.matchedSkills.map(skill => (
                          <span key={skill} className="tag" style={{ color: 'var(--purple)', borderColor: 'var(--border-glow)' }}>{skill}</span>
                        ))}
                      </div>
                    )}

                    {/* Match Reason */}
                    <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '2px solid var(--border-glow)', paddingLeft: 10 }}>
                      {job.matchReason}
                    </div>
                  </div>

                  {/* Score + Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                    <div className={`score-ring ${scoreClass}`} style={{ width: 56, height: 56, fontSize: '0.95rem' }}>
                      {job.matchScore}%
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => onGenerateFor(job)} id={`generate-${job.jobId}`}>
                        <Sparkles size={14} /> Generate
                      </button>
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                          View Post <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Briefcase size={24} /></div>
          <div className="empty-title">{search ? 'No results found' : 'No target jobs yet'}</div>
          <div className="empty-body">{search ? 'Try a different search term.' : 'Add your first target job and let AI score the match against your profile.'}</div>
          {!search && <button className="btn btn-primary" onClick={onAddJob}><Plus size={16} /> Add Your First Job</button>}
        </div>
      )}
    </div>
  );
};
