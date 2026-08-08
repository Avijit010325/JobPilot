import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CandidateProfile, Currency } from '../types';
import { CURRENCIES } from '../types';
import {
  User, Save, Plus, X, CheckCircle2, Camera, Upload, ImageIcon,
  AlertTriangle, CameraOff, RotateCcw, FileText, Download, Trash2,
  Sparkles, Check, Copy
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   LIVE CAMERA MODAL — uses getUserMedia API
══════════════════════════════════════════════════ */
interface CameraModalProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus]         = useState<'loading' | 'live' | 'no-camera' | 'denied' | 'captured'>('loading');
  const [captured, setCaptured]     = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCaptured(null);
    setStatus('loading');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('no-camera');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(d => d.kind === 'videoinput');
      if (!hasCamera) { setStatus('no-camera'); return; }
    } catch { /* proceed */ }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStatus('live');
    } catch (err: unknown) {
      const name = (err as DOMException)?.name;
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('no-camera');
      } else if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
      } else {
        setStatus('no-camera');
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startCamera, facingMode]);

  const handleCapture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);
    setStatus('captured');
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (captured) onCapture(captured);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'var(--bg-card-raised)', borderRadius:24, border:'1px solid var(--border-medium)', overflow:'hidden', width:'100%', maxWidth:520, boxShadow:'0 32px 80px rgba(0,0,0,0.6)', animation:'cardAppear 0.3s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'var(--gradient-main)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Camera size={16} color="#fff"/>
            </div>
            <span style={{ fontWeight:700, fontSize:'0.95rem' }}>Take a Photo</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:4, borderRadius:8 }}><X size={18}/></button>
        </div>

        {/* Camera viewport */}
        <div style={{ position:'relative', background:'#000', minHeight:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {status === 'loading' && (
            <div style={{ textAlign:'center', color:'#fff', padding:40 }}>
              <div style={{ width:40, height:40, border:'3px solid rgba(255,255,255,0.2)', borderTopColor:'var(--magenta)', borderRadius:'50%', margin:'0 auto 14px', animation:'spin 0.7s linear infinite' }}/>
              <div style={{ fontSize:'0.875rem', opacity:0.7 }}>Starting camera…</div>
            </div>
          )}

          {status === 'no-camera' && (
            <div style={{ textAlign:'center', padding:'40px 32px' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'var(--amber-dim)', border:'1px solid var(--amber-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <CameraOff size={26} color="var(--amber)"/>
              </div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Camera Available</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                No camera was found on this device.<br/>Please <strong style={{ color:'var(--purple)' }}>choose a photo from your device storage</strong> instead.
              </div>
            </div>
          )}

          {status === 'denied' && (
            <div style={{ textAlign:'center', padding:'40px 32px' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'var(--red-dim)', border:'1px solid var(--red-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <CameraOff size={26} color="var(--red)"/>
              </div>
              <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>Camera Access Denied</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                Camera permission was blocked.<br/>Allow camera access in your browser settings, then try again.
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => startCamera(facingMode)} style={{ marginTop:16 }}>
                <RotateCcw size={14}/> Try Again
              </button>
            </div>
          )}

          {status === 'live' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width:'100%', maxHeight:340, objectFit:'cover', display:'block', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          )}

          {status === 'captured' && captured && (
            <img src={captured} alt="Captured" style={{ width:'100%', maxHeight:340, objectFit:'cover', display:'block' }}/>
          )}

          {status === 'live' && (
            <button
              type="button"
              onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
              style={{ position:'absolute', top:12, right:12, width:36, height:36, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.5)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
              title="Flip camera"
            >
              <RotateCcw size={16}/>
            </button>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display:'none' }}/>

        <div style={{ padding:'16px 22px', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end' }}>
          {status === 'live' && (
            <button type="button" className="btn btn-primary" onClick={handleCapture} style={{ gap:8 }}>
              <Camera size={16}/> Capture
            </button>
          )}
          {status === 'captured' && (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleRetake}><RotateCcw size={14}/> Retake</button>
              <button type="button" className="btn btn-primary" onClick={handleConfirm} style={{ gap:8 }}><CheckCircle2 size={16}/> Use Photo</button>
            </>
          )}
          {(status === 'no-camera' || status === 'denied') && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          )}
          {status === 'loading' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   AVATAR UPLOADER
══════════════════════════════════════════════════ */
interface AvatarUploaderProps {
  avatarUrl?: string;
  name: string;
  onChange: (dataUrl: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl, name, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering]     = useState(false);
  const [showMenu, setShowMenu]     = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview]       = useState<string | undefined>(avatarUrl || '/default-avatar.png');

  useEffect(() => {
    setPreview(avatarUrl || '/default-avatar.png');
  }, [avatarUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowMenu(false);
  };

  const handleCameraCapture = (dataUrl: string) => {
    setPreview(dataUrl);
    onChange(dataUrl);
    setShowCamera(false);
  };

  const isCustomPhoto = preview && preview !== '/default-avatar.png';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />

      {showCamera && <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}

      <div
        style={{
          width:96, height:96, borderRadius:'50%', border:'3px solid var(--border-glow)',
          cursor:'pointer', position:'relative', overflow:'hidden', flexShrink:0,
          background: 'var(--bg-card-raised)',
          boxShadow: hovering ? '0 0 0 5px rgba(168,85,247,0.18)' : '0 0 0 0 transparent',
          transition:'box-shadow 0.2s'
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setShowMenu(v => !v)}
        title="Change profile photo"
      >
        <img
          src={preview || '/default-avatar.png'}
          alt={name}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.52)', display:'flex', alignItems:'center', justifyContent:'center', opacity: hovering ? 1 : 0, transition:'opacity 0.18s' }}>
          <Camera size={22} color="#fff" />
        </div>
      </div>

      {showMenu && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setShowMenu(false)} />
          <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, background:'var(--bg-card-raised)', border:'1px solid var(--border-medium)', borderRadius:14, padding:8, zIndex:50, minWidth:210, boxShadow:'0 16px 40px rgba(0,0,0,0.4)', animation:'slideUp 0.15s ease' }}>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', padding:'4px 10px 10px', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Change Photo</div>

            {[
              { icon: <Camera size={16} color="var(--purple)" />, label:'Take a Photo', iconBg:'var(--gradient-subtle)', iconBorder:'var(--border-glow)', action: () => { setShowMenu(false); setShowCamera(true); }, color: 'var(--text-primary)' },
              { icon: <ImageIcon size={16} color="var(--text-secondary)" />, label:'Choose from Gallery', iconBg:'var(--bg-card-raised)', iconBorder:'var(--border)', action: () => { fileInputRef.current?.click(); setShowMenu(false); }, color: 'var(--text-primary)' },
              ...(isCustomPhoto ? [{ icon: <X size={15} color="var(--red)" />, label:'Reset to Default Avatar', iconBg:'var(--red-dim)', iconBorder:'var(--red-border)', action: () => { setPreview('/default-avatar.png'); onChange('/default-avatar.png'); setShowMenu(false); }, color: 'var(--red)' }] : []),
            ].map(item => (
              <button key={item.label} type="button" onClick={item.action}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left', padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', background:'transparent', color: item.color, fontSize:'0.875rem', fontWeight:500, fontFamily:'var(--font-sans)', transition:'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ width:32, height:32, borderRadius:8, background: item.iconBg, border:`1px solid ${item.iconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ position:'absolute', bottom:2, right:2, width:26, height:26, borderRadius:'50%', background:'var(--gradient-main)', border:'2px solid var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(168,85,247,0.4)', pointerEvents:'none' }}>
        <Upload size={11} color="#fff" />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────── */
interface ProfilePageProps {
  profile: CandidateProfile;
  onSave: (updated: CandidateProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onSave }) => {
  const [form, setForm]               = useState({ ...profile });
  const [newSkill, setNewSkill]       = useState('');
  const [newRole, setNewRole]         = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [saved, setSaved]             = useState(false);
  const [salaryError, setSalaryError] = useState('');
  const [copiedResume, setCopiedResume] = useState(false);
  const [skillsExtracted, setSkillsExtracted] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const currencySymbol = CURRENCIES.find(c => c.code === form.salaryCurrency)?.symbol ?? '$';

  const validateSalary = (min: number, max: number): string => {
    if (min < 1) return 'Minimum salary must be at least 1.';
    if (max < 1) return 'Maximum salary must be at least 1.';
    if (max < min) return 'Maximum salary cannot be less than minimum salary.';
    return '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateSalary(form.salaryMin, form.salaryMax);
    if (err) { setSalaryError(err); return; }
    setSalaryError('');

    // URL validation for security
    if (form.portfolioUrl && !form.portfolioUrl.startsWith('http://') && !form.portfolioUrl.startsWith('https://')) {
      alert('Portfolio URL must start with https:// or http://');
      return;
    }
    if (form.linkedinUrl && !form.linkedinUrl.startsWith('http://') && !form.linkedinUrl.startsWith('https://')) {
      alert('LinkedIn URL must start with https:// or http://');
      return;
    }

    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setSalaryMin = (val: number) => {
    setForm(f => ({ ...f, salaryMin: val }));
    setSalaryError(validateSalary(val, form.salaryMax));
  };
  const setSalaryMax = (val: number) => {
    setForm(f => ({ ...f, salaryMax: val }));
    setSalaryError(validateSalary(form.salaryMin, val));
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };
  const addRole = () => {
    if (newRole.trim() && !form.targetRoles.includes(newRole.trim())) {
      setForm(f => ({ ...f, targetRoles: [...f.targetRoles, newRole.trim()] }));
      setNewRole('');
    }
  };
  const addLocation = () => {
    if (newLocation.trim() && !form.preferredLocations.includes(newLocation.trim())) {
      setForm(f => ({ ...f, preferredLocations: [...f.preferredLocations, newLocation.trim()] }));
      setNewLocation('');
    }
  };

  /* ── Resume File Upload Handler ── */
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    // Read text if plain text or markdown
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setForm(f => ({
        ...f,
        resumeFile: {
          name: file.name,
          size: sizeStr,
          uploadedAt: new Date().toISOString(),
          dataUrl: content.startsWith('data:') ? content : undefined,
        },
        resumeText: f.resumeText || (typeof content === 'string' && !content.startsWith('data:') ? content : f.resumeText),
      }));
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  /* ── Download Resume Text / File ── */
  const handleDownloadResume = () => {
    const textToDownload = form.resumeText || `${form.name} — ${form.title}\n\nSkills: ${form.skills.join(', ')}\n\nSummary:\n${form.summary || ''}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = form.resumeFile?.name?.replace(/\.[^/.]+$/, '') + '.txt' || `${form.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ── Auto-extract skills from resume text ── */
  const extractSkillsFromResume = () => {
    if (!form.resumeText) return;
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Next.js', 'Node.js', 'GraphQL',
      'Python', 'AWS', 'Docker', 'Kubernetes', 'Tailwind CSS', 'Redux',
      'PostgreSQL', 'MongoDB', 'Redis', 'Jest', 'Playwright', 'CI/CD',
      'WebSockets', 'REST APIs', 'Java', 'Go', 'Rust', 'Figma', 'Linux'
    ];

    const lower = form.resumeText.toLowerCase();
    const discovered = commonSkills.filter(s => lower.includes(s.toLowerCase()) && !form.skills.includes(s));

    if (discovered.length > 0) {
      setForm(f => ({ ...f, skills: [...f.skills, ...discovered] }));
      setSkillsExtracted(true);
      setTimeout(() => setSkillsExtracted(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ maxWidth:740, display:'flex', flexDirection:'column', gap:28 }}>

      {/* ── Basic Info ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <User size={18} color="var(--purple)" />
          </div>
          <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Basic Information</h2>
        </div>

        {/* Avatar + Profile Name Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
          <AvatarUploader
            avatarUrl={form.avatarUrl}
            name={form.name || 'U'}
            onChange={dataUrl => setForm(f => ({ ...f, avatarUrl: dataUrl || undefined }))}
          />

          <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  {form.name || 'Profile Name'}
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>Candidate Profile</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {form.title ? form.title : 'Set your target title below'} · {form.email}
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Profile Name *</label>
              <input
                className="input"
                required
                placeholder="e.g. Nadia Rachel"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ fontWeight: 600 }}
              />
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap:14, marginBottom:14 }}>
          <div className="field">
            <label className="field-label">Email Address *</label>
            <input className="input" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />
          </div>
          <div className="field">
            <label className="field-label">Years of Experience</label>
            <input className="input" type="number" min={0} max={40} value={form.experienceYears} onChange={e => setForm(f => ({ ...f, experienceYears:parseInt(e.target.value) || 0 }))} />
          </div>
        </div>

        <div className="grid-2" style={{ gap:14, marginBottom:14 }}>
          <div className="field">
            <label className="field-label">Current / Target Title</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="field">
            <label className="field-label">Portfolio / Website</label>
            <input className="input" type="url" value={form.portfolioUrl ?? ''} onChange={e => setForm(f => ({ ...f, portfolioUrl:e.target.value }))} placeholder="https://yoursite.dev" />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label className="field-label">LinkedIn Profile URL</label>
          <input className="input" type="url" value={form.linkedinUrl ?? ''} onChange={e => setForm(f => ({ ...f, linkedinUrl:e.target.value }))} placeholder="https://linkedin.com/in/…" />
        </div>

        <div className="field">
          <label className="field-label">Professional Summary</label>
          <textarea className="textarea" rows={3} value={form.summary ?? ''} onChange={e => setForm(f => ({ ...f, summary:e.target.value }))} placeholder="2–3 sentences about your background. Used by AI to generate tailored materials." />
        </div>
      </div>

      {/* ── Resume / CV Section ── */}
      <div className="card" style={{ padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FileText size={18} color="var(--purple)" />
            </div>
            <div>
              <h2 style={{ fontSize:'1rem', fontWeight:700 }}>Resume & Experience Highlights</h2>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Uploaded resume is used by AI to generate customized cover letters and tailored resume bullets.</p>
            </div>
          </div>

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            style={{ display:'none' }}
            onChange={handleResumeUpload}
          />
        </div>

        {/* Uploaded File Card */}
        {form.resumeFile ? (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 18px', background:'var(--bg-card-raised)', border:'1px solid var(--border-glow)',
            borderRadius:14, marginBottom:20, flexWrap:'wrap', gap:12
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:200 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:'var(--gradient-main)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-primary)', wordBreak:'break-all' }}>
                  {form.resumeFile.name}
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>
                  {form.resumeFile.size} · Uploaded {new Date(form.resumeFile.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDownloadResume}
                title="Download resume text"
                style={{ gap:6 }}
              >
                <Download size={14} /> Download
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => resumeInputRef.current?.click()}
                title="Replace file"
              >
                Replace
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setForm(f => ({ ...f, resumeFile: undefined }))}
                style={{ color:'var(--red)', padding:'6px 10px' }}
                title="Remove resume"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone / Upload Trigger */
          <div
            onClick={() => resumeInputRef.current?.click()}
            style={{
              padding:'28px 20px', border:'2px dashed var(--border-medium)', borderRadius:16,
              background:'var(--bg-surface)', textAlign:'center', cursor:'pointer',
              transition:'all 0.2s', marginBottom:20
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.background = 'var(--bg-card-raised)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <div style={{ width:44, height:44, borderRadius:12, background:'var(--gradient-subtle)', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Upload size={20} color="var(--purple)" />
            </div>
            <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
              Click to Upload Your Resume
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
              Supports PDF, DOCX, DOC, or TXT (up to 10MB)
            </div>
          </div>
        )}

        {/* Resume Text Area & AI Extraction */}
        <div className="field" style={{ margin:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:8 }}>
            <label className="field-label" style={{ margin:0 }}>Resume Text / Experience Content</label>

            <div style={{ display:'flex', gap:8 }}>
              {form.resumeText && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={extractSkillsFromResume}
                  style={{ gap:6, fontSize:'0.76rem', color:'var(--purple)' }}
                >
                  <Sparkles size={13} /> {skillsExtracted ? 'Skills Extracted! ✓' : 'Extract Skills to Profile'}
                </button>
              )}
              {form.resumeText && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(form.resumeText || '');
                    setCopiedResume(true);
                    setTimeout(() => setCopiedResume(false), 2000);
                  }}
                  style={{ gap:4, fontSize:'0.76rem' }}
                >
                  {copiedResume ? <><Check size={12} color="var(--green)"/> Copied</> : <><Copy size={12}/> Copy Text</>}
                </button>
              )}
            </div>
          </div>

          <textarea
            className="textarea"
            rows={8}
            value={form.resumeText ?? ''}
            onChange={e => setForm(f => ({ ...f, resumeText: e.target.value }))}
            placeholder="Paste your resume text here (Work experience, achievements, education). The AI Generator will use this content to write targeted cover letters and resume bullets for each job you apply to."
            style={{ fontFamily:'var(--font-sans)', lineHeight:1.65 }}
          />
          <span className="field-hint">
            {form.resumeText ? `${form.resumeText.split(/\s+/).filter(Boolean).length} words · ${form.resumeText.length} characters` : 'Tip: Paste your resume text to enable instant AI tailoring against any job posting.'}
          </span>
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="card" style={{ padding:28 }}>
        <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Skills</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
          {form.skills.map(s => (
            <span key={s} className="tag" style={{ color:'var(--purple)', borderColor:'var(--border-glow)' }}>
              {s}
              <button type="button" onClick={() => setForm(f => ({ ...f, skills:f.skills.filter(x => x !== s) }))} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}><X size={12}/></button>
            </span>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input className="input" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="e.g. Kubernetes, Python, GraphQL" style={{ flex:1 }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={15}/> Add</button>
        </div>
      </div>

      {/* ── Target Roles ── */}
      <div className="card" style={{ padding:28 }}>
        <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:8 }}>Target Roles</h2>
        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>Used by AI to align opportunities with your career goals.</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
          {form.targetRoles.map(r => (
            <span key={r} className="tag">
              {r}
              <button type="button" onClick={() => setForm(f => ({ ...f, targetRoles:f.targetRoles.filter(x => x !== r) }))} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}><X size={12}/></button>
            </span>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input className="input" value={newRole} onChange={e => setNewRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRole())} placeholder="e.g. Staff Engineer, Engineering Manager" style={{ flex:1 }} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addRole}><Plus size={15}/> Add</button>
        </div>
      </div>

      {/* ── Preferences ── */}
      <div className="card" style={{ padding:28 }}>
        <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Preferences</h2>

        {/* Locations */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:10 }}>Preferred Locations</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
            {form.preferredLocations.map(l => (
              <span key={l} className="tag">
                {l}
                <button type="button" onClick={() => setForm(f => ({ ...f, preferredLocations:f.preferredLocations.filter(x => x !== l) }))} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}><X size={12}/></button>
              </span>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" value={newLocation} onChange={e => setNewLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLocation())} placeholder="e.g. Remote, London, Singapore" style={{ flex:1 }} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addLocation}><Plus size={15}/> Add</button>
          </div>
        </div>

        {/* Currency + Salary */}
        <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>Target Salary</div>

        {salaryError && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'var(--red-dim)', border:'1px solid var(--red-border)', borderRadius:12, color:'var(--red)', fontSize:'0.82rem', fontWeight:500, marginBottom:14 }}>
            <AlertTriangle size={15}/> {salaryError}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'160px 1fr 1fr', gap:12, alignItems:'end' }}>
          <div className="field">
            <label className="field-label">Currency</label>
            <select className="select input" value={form.salaryCurrency} onChange={e => setForm(f => ({ ...f, salaryCurrency: e.target.value as Currency }))}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Minimum ({currencySymbol}/yr)</label>
            <input
              className="input"
              type="number" min={1}
              value={form.salaryMin}
              onChange={e => setSalaryMin(parseInt(e.target.value) || 0)}
              style={{ borderColor: salaryError && form.salaryMin < 1 ? 'var(--red)' : undefined }}
            />
          </div>

          <div className="field">
            <label className="field-label">Maximum ({currencySymbol}/yr)</label>
            <input
              className="input"
              type="number" min={1}
              value={form.salaryMax}
              onChange={e => setSalaryMax(parseInt(e.target.value) || 0)}
              style={{ borderColor: salaryError && form.salaryMax < form.salaryMin ? 'var(--red)' : undefined }}
            />
          </div>
        </div>

        <div style={{ marginTop:10, fontSize:'0.76rem', color:'var(--text-muted)' }}>
          Displayed as: <strong style={{ color:'var(--text-secondary)' }}>{currencySymbol}{form.salaryMin.toLocaleString()} – {currencySymbol}{form.salaryMax.toLocaleString()}</strong> per year
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button type="submit" className="btn btn-primary btn-lg" id="save-profile-btn">
          {saved ? <><CheckCircle2 size={18}/> Saved!</> : <><Save size={18}/> Save Profile</>}
        </button>
      </div>
    </form>
  );
};
