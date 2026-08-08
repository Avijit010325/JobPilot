import React, { useState, useEffect, useCallback } from 'react';
import type { CandidateProfile, JobListing, JobApplication, AppStatus } from '../types';
import { generateMaterials, computeNeedsFollowUp } from '../lib/ai';
import {
  X, Sparkles, Copy, Check, CheckCircle2, Save,
  RotateCcw, Briefcase, MapPin, ArrowUpRight, Award, AlertTriangle
} from 'lucide-react';

import { checkRateLimit } from '../lib/firebase';

interface ApplicationEditorProps {
  job: JobListing | null;
  existingApp: JobApplication | null;
  profile: CandidateProfile;
  onSave: (app: JobApplication) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { status: AppStatus; label: string }[] = [
  { status: 'draft', label: 'Draft — Not Submitted' },
  { status: 'applied', label: 'Applied' },
  { status: 'responded', label: 'Responded' },
  { status: 'interviewing', label: 'Interviewing' },
  { status: 'offered', label: 'Offer Received 🎉' },
  { status: 'rejected', label: 'Rejected' },
];

export const ApplicationEditor: React.FC<ApplicationEditorProps> = ({
  job, existingApp, profile, onSave, onClose
}) => {
  const [bullets, setBullets] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [outreach, setOutreach] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<AppStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bullets' | 'cover' | 'outreach' | 'notes'>('cover');
  const [isNew, setIsNew] = useState(false);

  const doGenerate = useCallback(async () => {
    if (!job) return;
    setErrorMsg('');

    // Rate limiting for expensive AI generation
    const rate = checkRateLimit(`ai_gen_${profile.uid}`, 15, 60000);
    if (!rate.allowed) {
      setErrorMsg(`AI generation rate limit reached. Please wait ${Math.ceil(rate.retryAfterMs / 1000)}s.`);
      return;
    }

    setLoading(true);
    try {
      const m = await generateMaterials(job, profile);
      setBullets(m.resumeBullets);
      setCoverLetter(m.coverLetter);
      setOutreach(m.outreachMessage);
      setStatus('draft');
    } catch {
      setErrorMsg('Failed to generate materials. Please try again.');
    } finally {
      setLoading(false);
      setActiveTab('cover');
    }
  }, [job, profile]);

  useEffect(() => {
    if (existingApp) {
      setBullets(existingApp.resumeBullets || []);
      setCoverLetter(existingApp.coverLetter || '');
      setOutreach(existingApp.outreachMessage || '');
      setNotes(existingApp.notes ?? '');
      setStatus(existingApp.status || 'draft');
      setIsNew(false);
    } else if (job) {
      setIsNew(true);
      doGenerate();
    }
  }, [job?.jobId, existingApp?.applicationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const doCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveWithStatus = (overrideStatus?: AppStatus) => {
    if (!job) return;
    const finalStatus = overrideStatus ?? status;
    const now = new Date().toISOString();

    const app: JobApplication = {
      applicationId: existingApp?.applicationId ?? `app_${Date.now()}`,
      ownerId: profile.uid,
      jobId: job.jobId,
      company: job.company,
      companyLogo: job.companyLogo,
      role: job.title,
      resumeBullets: bullets,
      coverLetter,
      outreachMessage: outreach,
      status: finalStatus,
      appliedAt: finalStatus === 'draft'
        ? (existingApp?.appliedAt ?? null)
        : (existingApp?.appliedAt ?? now),
      needsFollowUp: false,
      notes,
      updatedAt: now,
      createdAt: existingApp?.createdAt ?? now,
    };

    app.needsFollowUp = computeNeedsFollowUp(app);
    onSave(app);
    onClose();
  };

  if (!job) return null;

  const scoreClass = job.matchScore >= 88 ? 'score-high' : job.matchScore >= 75 ? 'score-mid' : 'score-low';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 780 }}>
        {/* Header */}
        <div className="modal-header" style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <div className={`score-ring ${scoreClass}`} style={{ width: 40, height: 40, fontSize: '0.75rem' }}>{job.matchScore}%</div>
              <span className="badge badge-green"><Sparkles size={11} /> AI Generated</span>
              {isNew && <span className="badge badge-amber">New Application</span>}
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>
              {job.title}
            </h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Briefcase size={13} /> {job.company}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <MapPin size={13} /> {job.location}
              </span>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--purple)', fontWeight: 600 }}>
                  View Posting <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {errorMsg && (
          <div style={{ margin: '16px 28px 0', padding: '10px 14px', background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', borderRadius: 12, color: 'var(--amber)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} /> {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px', gap: 18 }}>
            <div className="spinner spinner-lg" />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Generating Tailored Materials…</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 340 }}>
                AI is analyzing your profile skills and the {job.company} job description to write custom application materials.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Content Tabs */}
            <div style={{ padding: '20px 28px 0' }}>
              <div className="tabs">
                {([
                  { id: 'cover', label: 'Cover Letter' },
                  { id: 'bullets', label: 'Resume Bullets' },
                  { id: 'outreach', label: 'Outreach DM' },
                  { id: 'notes', label: 'Private Notes' },
                ] as const).map(t => (
                  <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-body">
              {/* Cover Letter */}
              {activeTab === 'cover' && (
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="field-label">Personalized Cover Letter</label>
                    <button className="btn btn-ghost btn-sm" onClick={() => doCopy(coverLetter, 'cover')}>
                      {copied === 'cover' ? <><Check size={13} color="var(--green)" /> Copied!</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>
                  <textarea className="textarea" rows={10} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7 }} />
                </div>
              )}

              {/* Resume Bullets */}
              {activeTab === 'bullets' && (
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label className="field-label">Tailored Resume Bullets</label>
                    <button className="btn btn-ghost btn-sm" onClick={() => doCopy(bullets.map(b => `• ${b}`).join('\n'), 'bullets')}>
                      {copied === 'bullets' ? <><Check size={13} color="var(--green)" /> Copied!</> : <><Copy size={13} /> Copy All</>}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bullets.map((bullet, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--magenta)', fontWeight: 700, fontSize: '1.1rem', lineHeight: '1.4', flexShrink: 0 }}>•</span>
                        <textarea
                          className="textarea"
                          rows={2}
                          value={bullet}
                          onChange={e => {
                            const next = [...bullets];
                            next[i] = e.target.value;
                            setBullets(next);
                          }}
                          style={{ minHeight: 'unset', lineHeight: 1.6 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outreach DM */}
              {activeTab === 'outreach' && (
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="field-label">Recruiter Outreach Message (LinkedIn / Email)</label>
                    <button className="btn btn-ghost btn-sm" onClick={() => doCopy(outreach, 'outreach')}>
                      {copied === 'outreach' ? <><Check size={13} color="var(--green)" /> Copied!</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>
                  <textarea className="textarea" rows={5} value={outreach} onChange={e => setOutreach(e.target.value)} style={{ lineHeight: 1.7 }} />
                  <span className="field-hint">Send this directly to the hiring manager or recruiter on LinkedIn.</span>
                </div>
              )}

              {/* Notes */}
              {activeTab === 'notes' && (
                <div className="field">
                  <label className="field-label">Private Interview & Follow-up Notes</label>
                  <textarea
                    className="textarea"
                    rows={7}
                    placeholder="e.g. Recruiter call scheduled for Monday with Sarah. Key questions to ask: remote flexibility, tech stack roadmap."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ lineHeight: 1.7 }}
                  />
                  <span className="field-hint">Private notes to track contacts, conversation logs, salary offers, or interviewer feedback.</span>
                </div>
              )}

              {/* Status Selector + Regenerate Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div className="field" style={{ flex: 1, minWidth: 200, margin: 0 }}>
                  <label className="field-label" style={{ fontWeight: 700 }}>Current Application Status</label>
                  <select
                    className="select input"
                    style={{ marginTop: 4, fontWeight: 700 }}
                    value={status}
                    onChange={e => setStatus(e.target.value as AppStatus)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.status} value={opt.status}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={doGenerate}
                  style={{ marginTop: 22, gap: 6 }}
                >
                  <RotateCcw size={14} /> Regenerate AI Content
                </button>
              </div>
            </div>

            {/* Modal Footer with Clear, Working Actions */}
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                {status === 'draft' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSaveWithStatus('draft')}
                    >
                      <Save size={15} /> Save Draft
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveWithStatus('applied')}
                      id="mark-applied-btn"
                    >
                      <CheckCircle2 size={16} /> Mark as Applied & Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSaveWithStatus(status)}
                    >
                      <Save size={15} /> Save Changes
                    </button>
                    {status !== 'offered' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ background: 'var(--green)', borderColor: 'var(--green)' }}
                        onClick={() => handleSaveWithStatus('offered')}
                      >
                        <Award size={16} /> Received Offer 🎉
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
