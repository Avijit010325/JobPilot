import { describe, it, expect } from 'vitest';
import { scoreJobMatch, generateMaterials, computeNeedsFollowUp, timeAgo, formatSalary } from '../lib/ai';
import type { CandidateProfile, JobListing, JobApplication } from '../types';

const mockProfile: CandidateProfile = {
  uid: 'test_uid_101',
  name: 'Sarah Connor',
  email: 'sarah.connor@cyberdyne.com',
  title: 'Lead Systems Architect',
  targetRoles: ['Lead Systems Architect', 'Staff Software Engineer'],
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
  preferredLocations: ['Remote', 'San Francisco, CA'],
  salaryMin: 160000,
  salaryMax: 220000,
  salaryCurrency: 'USD',
  experienceYears: 8,
  summary: 'Architecting resilient cloud-native web systems.',
};

const mockJob: JobListing = {
  jobId: 'job_react_101',
  ownerId: 'test_uid_101',
  company: 'Cyberdyne AI',
  title: 'Lead Systems Architect — Cloud Platform',
  location: 'San Francisco, CA',
  locationType: 'remote',
  salaryMin: 170000,
  salaryMax: 230000,
  salaryCurrency: 'USD',
  url: 'https://cyberdyne.ai/jobs/lead-arch',
  description: 'We are seeking a Lead Systems Architect skilled in TypeScript, React, Node.js, and Docker to build high-scale cloud platforms.',
  matchScore: 92,
  matchReason: 'High overlap in TypeScript, React, Node.js, and Docker.',
  matchedSkills: ['TypeScript', 'React', 'Node.js', 'Docker'],
  addedAt: new Date().toISOString(),
};

describe('AI Match Scoring Engine', () => {
  it('should accurately calculate match score and extract matching skills', async () => {
    const result = await scoreJobMatch(
      { title: mockJob.title, description: mockJob.description, company: mockJob.company },
      mockProfile
    );

    expect(result.matchScore).toBeGreaterThanOrEqual(60);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.matchReason.length).toBeGreaterThan(10);
  });

  it('should return appropriate match reason based on score threshold', async () => {
    const highMatch = await scoreJobMatch(
      { title: 'Lead Systems Architect', description: 'TypeScript React Node.js Docker Kubernetes PostgreSQL', company: 'Tech Inc' },
      mockProfile
    );
    expect(highMatch.matchReason).toContain('align directly');

    const lowMatch = await scoreJobMatch(
      { title: 'Ruby Rails Developer', description: 'Seeking expert in Ruby, Elixir, and Phoenix framework with no JS experience.', company: 'Legacy Co' },
      mockProfile
    );
    expect(lowMatch.matchedSkills.length).toBe(0);
    expect(lowMatch.matchReason).toContain('Moderate match');
  });
});

describe('AI Application Material Generator', () => {
  it('should generate tailored cover letter, resume bullets, and outreach DM', async () => {
    const materials = await generateMaterials(mockJob, mockProfile);

    // Cover letter checks
    expect(materials.coverLetter).toContain('Dear Cyberdyne AI Hiring Team');
    expect(materials.coverLetter).toContain('Lead Systems Architect — Cloud Platform');
    expect(materials.coverLetter).toContain('Sarah Connor');
    expect(materials.coverLetter).toContain('8+ years');

    // Resume bullets checks
    expect(materials.resumeBullets.length).toBeGreaterThanOrEqual(3);
    expect(materials.resumeBullets[0]).toContain('Cyberdyne AI');

    // Recruiter outreach checks
    expect(materials.outreachMessage).toContain('Cyberdyne AI');
    expect(materials.outreachMessage).toContain('Lead Systems Architect — Cloud Platform');
  });
});

describe('Application Follow-up Computation', () => {
  it('should flag applications older than 7 days as needing follow-up', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const app: JobApplication = {
      applicationId: 'app_1',
      jobId: 'job_1',
      ownerId: 'test_uid_101',
      company: 'Stripe',
      role: 'Staff Engineer',
      status: 'applied',
      appliedAt: tenDaysAgo,
      needsFollowUp: false,
      resumeBullets: ['Led architecture at scale.'],
      coverLetter: 'Dear Hiring Team...',
      outreachMessage: 'Hi, I applied for the role...',
      createdAt: tenDaysAgo,
      updatedAt: tenDaysAgo,
    };

    expect(computeNeedsFollowUp(app)).toBe(true);
  });

  it('should NOT flag applications applied recently (under 7 days)', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const app: JobApplication = {
      applicationId: 'app_2',
      jobId: 'job_2',
      ownerId: 'test_uid_101',
      company: 'Vercel',
      role: 'Frontend Engineer',
      status: 'applied',
      appliedAt: twoDaysAgo,
      needsFollowUp: false,
      resumeBullets: ['Shipped Next.js features.'],
      coverLetter: 'Dear Vercel Team...',
      outreachMessage: 'Hi, excited about Next.js...',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    };

    expect(computeNeedsFollowUp(app)).toBe(false);
  });

  it('should NOT flag non-applied or responded applications', () => {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const app: JobApplication = {
      applicationId: 'app_3',
      jobId: 'job_3',
      ownerId: 'test_uid_101',
      company: 'Linear',
      role: 'Product Engineer',
      status: 'interviewing',
      appliedAt: fifteenDaysAgo,
      needsFollowUp: false,
      resumeBullets: ['Product engineering.'],
      coverLetter: 'Dear Linear Team...',
      outreachMessage: 'Hi, great to connect...',
      createdAt: fifteenDaysAgo,
      updatedAt: fifteenDaysAgo,
    };

    expect(computeNeedsFollowUp(app)).toBe(false);
  });
});

describe('Salary & Time Formatters', () => {
  it('should format numbers in thousands without currency sign duplication', () => {
    expect(formatSalary(150000)).toBe('150k');
    expect(formatSalary(85000)).toBe('85k');
    expect(formatSalary(500)).toBe('500');
  });

  it('should correctly format relative time strings', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('today');

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(yesterday)).toBe('yesterday');

    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(fourDaysAgo)).toBe('4d ago');
  });
});
