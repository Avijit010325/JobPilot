import { CandidateProfile, JobListing, JobApplication } from '../types';

/**
 * Simulated AI match scoring.
 * In production this would call Gemini API server-side.
 */
export async function scoreJobMatch(
  job: { title: string; description: string; company: string },
  profile: CandidateProfile
): Promise<{ matchScore: number; matchReason: string; matchedSkills: string[] }> {
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

  const desc = (job.description + ' ' + job.title).toLowerCase();
  const matched = profile.skills.filter(s => desc.includes(s.toLowerCase()));
  const ratio = profile.skills.length > 0 ? matched.length / profile.skills.length : 0.5;

  // Weighted score: skill overlap + base quality score
  const base = 64 + Math.round(Math.random() * 10);
  const score = Math.min(97, Math.round(base + ratio * 33));

  let reason = '';
  if (score >= 88) reason = `Outstanding match. ${matched.slice(0, 3).join(', ')} align directly with the role requirements and your target title of "${profile.targetRoles[0]}".`;
  else if (score >= 75) reason = `Good alignment on ${matched.slice(0, 2).join(' & ')}. Role at ${job.company} maps well to your experience level and preferences.`;
  else reason = `Moderate match. Some skill overlap detected. Consider highlighting transferable experience.`;

  return { matchScore: score, matchReason: reason, matchedSkills: matched.slice(0, 4) };
}

/**
 * Simulated AI material generation.
 * In production this would call Gemini API server-side.
 */
export async function generateMaterials(
  job: JobListing,
  profile: CandidateProfile
): Promise<{ resumeBullets: string[]; coverLetter: string; outreachMessage: string }> {
  await new Promise(r => setTimeout(r, 1000 + Math.random() * 700));

  const skills = profile.skills.slice(0, 4).join(', ');
  const firstSkill = profile.skills[0] ?? 'modern web technologies';
  const secondSkill = profile.skills[1] ?? 'TypeScript';

  const resumeBullets = [
    `Delivered high-impact features at ${job.company}-scale using ${firstSkill} and ${secondSkill}, reducing time-to-market by 35%.`,
    `Architected scalable frontend systems serving 1M+ users, applying ${profile.skills.slice(0, 3).join(', ')} in production environments.`,
    `Collaborated cross-functionally with product and design teams to ship the "${job.title}" class of UX improvements, improving user retention by 22%.`,
    `Championed code quality and engineering culture through technical mentoring, design reviews, and open-source contributions.`,
  ];

  const coverLetter = `Dear ${job.company} Hiring Team,

I'm writing to express my enthusiastic interest in the ${job.title} position. With ${profile.experienceYears}+ years specializing in ${skills}, I've built a track record of shipping high-quality, high-impact products that users love.

What excites me most about ${job.company} is ${job.matchReason.toLowerCase().split('.')[0]}. My experience aligns directly with what this role demands — I've navigated the exact technical challenges your team faces, and I'm energized by the opportunity to bring that expertise to ${job.company}.

I would love to discuss how my background in ${firstSkill} and ${secondSkill} can accelerate the team's goals.

Warm regards,
${profile.name}`;

  const outreachMessage = `Hi! I recently applied for the ${job.title} role at ${job.company} and wanted to reach out personally. I have ${profile.experienceYears}+ years shipping ${firstSkill} and ${secondSkill} at scale, and I'm genuinely excited about what ${job.company} is building. Would love to connect or chat if you have a few minutes!`;

  return { resumeBullets, coverLetter, outreachMessage };
}

/** Computes whether an application needs a follow-up (> 7 days applied with no response) */
export function computeNeedsFollowUp(app: JobApplication): boolean {
  if (!app.appliedAt || app.status !== 'applied') return false;
  const daysDiff = (Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 7;
}

/** Returns human-readable time since a date */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Returns a number formatted as thousands (e.g. 150k) */
export function formatSalary(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return `${n}`;
}
