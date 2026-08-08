import React, { useState } from 'react';
import type { CandidateProfile, JobListing } from '../types';
import { Sparkles, ArrowRight, Briefcase } from 'lucide-react';

interface GeneratorPageProps {
  profile: CandidateProfile;
  jobs: JobListing[];
  onGenerateFor: (job: JobListing) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({ jobs, onGenerateFor }) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.jobId ?? '');
  const selectedJob = jobs.find(j => j.jobId === selectedJobId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760 }}>
      {/* Intro Banner */}
      <div className="ai-banner" style={{ textAlign: 'left', padding: '24px 28px' }}>
        <div className="ai-banner-title">
          <Sparkles size={22} color="var(--magenta)" />
          <span>AI Application Generator</span>
        </div>
        <p className="ai-banner-desc" style={{ maxWidth: 600 }}>
          Select a target job below and click <strong style={{ color: '#fff' }}>Generate Materials</strong> to instantly create a tailored cover letter, resume bullets, and a personalized recruiter outreach message — all personalized to your profile.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Personalized cover letter', 'Tailored resume bullets', 'Recruiter outreach DM'].map(item => (
            <span key={item} className="ai-banner-chip">
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Job Selector */}
      {jobs.length > 0 ? (
        <>
          <div className="field">
            <label className="field-label">Select a Target Job to Generate For</label>
            <select
              className="select input"
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              style={{ marginTop: 4 }}
            >
              {jobs.map(j => (
                <option key={j.jobId} value={j.jobId}>
                  {j.company} — {j.title} ({j.matchScore}% match)
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: 'var(--bg-card-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, flexShrink: 0 }}>
                  {selectedJob.companyLogo
                    ? <img src={selectedJob.companyLogo} alt={selectedJob.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <Briefcase size={22} color="var(--text-muted)" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{selectedJob.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{selectedJob.company} · {selectedJob.location}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '2px solid var(--border-glow)', paddingLeft: 10 }}>
                    <span style={{ color: 'var(--purple)', fontWeight: 600 }}>AI Match: {selectedJob.matchScore}%</span> — {selectedJob.matchReason}
                  </div>
                  {selectedJob.matchedSkills.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {selectedJob.matchedSkills.map(s => <span key={s} className="tag" style={{ color: 'var(--purple)', borderColor: 'var(--border-glow)' }}>{s}</span>)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => onGenerateFor(selectedJob)}
                  id="generate-materials-btn"
                >
                  <Sparkles size={18} /> Generate Application Materials <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> All AI-generated content is based on your profile. You'll be able to review, edit every section before saving or submitting. Materials are never sent automatically.
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><Briefcase size={24} /></div>
          <div className="empty-title">No target jobs yet</div>
          <div className="empty-body">Add at least one target job from the Jobs page to generate application materials.</div>
        </div>
      )}
    </div>
  );
};
