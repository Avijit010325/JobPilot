import React, { useState, useEffect } from 'react';
import type { CandidateProfile, JobListing, Currency } from '../types';
import { CURRENCIES } from '../types';
import { Sparkles, X, AlertTriangle } from 'lucide-react';
import { scoreJobMatch } from '../lib/ai';
import { checkRateLimit } from '../lib/firebase';

interface AddJobModalProps {
  profile: CandidateProfile;
  onSave: (job: JobListing) => void;
  onClose: () => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ profile, onSave, onClose }) => {
  const [company, setCompany]       = useState('');
  const [title, setTitle]           = useState('');
  const [location, setLocation]     = useState('');
  const [locationType, setLocationType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [salaryCurrency, setSalaryCurrency] = useState<Currency>('USD');
  const [salaryMin, setSalaryMinRaw] = useState('');
  const [salaryMax, setSalaryMaxRaw] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const [url, setUrl]               = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const currencySymbol = CURRENCIES.find(c => c.code === salaryCurrency)?.symbol ?? '$';

  const validateSalary = (min: string, max: string): string => {
    const minN = parseInt(min);
    const maxN = parseInt(max);
    if (min && minN < 1) return 'Minimum salary must be at least 1.';
    if (max && maxN < 1) return 'Maximum salary must be at least 1.';
    if (min && max && maxN < minN) return 'Maximum salary cannot be less than minimum salary.';
    return '';
  };

  const handleMinChange = (v: string) => {
    setSalaryMinRaw(v);
    setSalaryError(validateSalary(v, salaryMax));
  };
  const handleMaxChange = (v: string) => {
    setSalaryMaxRaw(v);
    setSalaryError(validateSalary(salaryMin, v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Salary validation before submit
    const salaryErr = validateSalary(salaryMin, salaryMax);
    if (salaryErr) { setSalaryError(salaryErr); return; }

    if (!company.trim() || !title.trim() || !description.trim()) {
      setError('Company, role title, and job description are required.');
      return;
    }

    // URL validation: block dangerous protocols like javascript:
    if (url.trim() && !url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      setError('Job link must start with https:// or http://');
      return;
    }

    // Rate limiting on expensive AI scoring endpoint
    const rateCheck = checkRateLimit(`ai_score_${profile.uid}`, 20, 60000);
    if (!rateCheck.allowed) {
      setError(`Rate limit reached. Please wait ${Math.ceil(rateCheck.retryAfterMs / 1000)}s before adding more jobs.`);
      return;
    }

    setLoading(true);
    try {
      const { matchScore, matchReason, matchedSkills } = await scoreJobMatch(
        { title, description, company },
        profile
      );

      const newJob: JobListing = {
        jobId: `job_${Date.now()}`,
        ownerId: profile.uid,
        company: company.trim(),
        title: title.trim(),
        location: location.trim() || 'Unspecified',
        locationType,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        salaryCurrency: salaryCurrency,
        url: url.trim(),
        description: description.trim(),
        matchScore,
        matchReason,
        matchedSkills,
        addedAt: new Date().toISOString(),
      };

      onSave(newJob);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--gradient-glow)' }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add Target Job</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Paste job details — AI will score match against your profile</p>
            </div>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid var(--red-border)', borderRadius: 10, color: 'var(--red)', fontSize: '0.82rem', fontWeight: 500 }}>
                <AlertTriangle size={15} /> {error}
              </div>
            )}

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="field-label">Company *</label>
                <input className="input" required placeholder="e.g. Stripe, Vercel" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Role Title *</label>
                <input className="input" required placeholder="e.g. Senior Frontend Engineer" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="field-label">Location</label>
                <input className="input" placeholder="e.g. San Francisco / Remote" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Work Type</label>
                <select className="select input" value={locationType} onChange={e => setLocationType(e.target.value as 'remote' | 'hybrid' | 'onsite')}>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>

            {/* ── Job Salary ── */}
            <div>
              <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:10 }}>Job Salary <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></div>

              {/* Salary error */}
              {salaryError && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 13px', background:'var(--red-dim)', border:'1px solid var(--red-border)', borderRadius:10, color:'var(--red)', fontSize:'0.8rem', fontWeight:500, marginBottom:10 }}>
                  <AlertTriangle size={14}/> {salaryError}
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'150px 1fr 1fr', gap:10 }}>
                {/* Currency */}
                <div className="field">
                  <label className="field-label">Currency</label>
                  <select
                    className="select input"
                    value={salaryCurrency}
                    onChange={e => setSalaryCurrency(e.target.value as Currency)}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Min */}
                <div className="field">
                  <label className="field-label">Minimum ({currencySymbol}/yr)</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    placeholder="e.g. 120000"
                    value={salaryMin}
                    onChange={e => handleMinChange(e.target.value)}
                    style={{ borderColor: salaryError && salaryMin && parseInt(salaryMin) < 1 ? 'var(--red)' : undefined }}
                  />
                </div>

                {/* Max */}
                <div className="field">
                  <label className="field-label">Maximum ({currencySymbol}/yr)</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    placeholder="e.g. 160000"
                    value={salaryMax}
                    onChange={e => handleMaxChange(e.target.value)}
                    style={{ borderColor: salaryError && salaryMax && parseInt(salaryMax) < parseInt(salaryMin) ? 'var(--red)' : undefined }}
                  />
                </div>
              </div>

              {/* Live preview */}
              {(salaryMin || salaryMax) && !salaryError && (
                <div style={{ marginTop:8, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                  Range: <strong style={{ color:'var(--text-secondary)' }}>
                    {salaryMin ? `${currencySymbol}${parseInt(salaryMin).toLocaleString()}` : '—'}
                    {' – '}
                    {salaryMax ? `${currencySymbol}${parseInt(salaryMax).toLocaleString()}` : '—'}
                  </strong> per year
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label">Job Posting URL (optional)</label>
              <input className="input" type="url" placeholder="https://company.com/careers/role" value={url} onChange={e => setUrl(e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Job Description / Requirements *</label>
              <textarea
                className="textarea"
                required
                rows={5}
                placeholder="Paste the full job description here. The more detail you provide, the better the AI match score and generated materials will be…"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <span className="field-hint">AI will compare this against your profile skills: {profile.skills.slice(0, 4).join(', ')}…</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-job-btn">
              {loading ? (
                <>
                  <div className="spinner" /> Calculating Match…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Calculate AI Match & Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
