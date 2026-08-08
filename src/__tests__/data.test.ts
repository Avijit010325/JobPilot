import { describe, it, expect } from 'vitest';
import { seedProfile, seedJobs, seedApplications } from '../lib/data';
import { CURRENCIES, AppStatus } from '../types';

describe('Data Models & Seed Integrity', () => {
  it('should have a well-formed default candidate profile', () => {
    expect(seedProfile.name).toBeTruthy();
    expect(seedProfile.email).toContain('@');
    expect(seedProfile.skills.length).toBeGreaterThanOrEqual(3);
    expect(seedProfile.salaryMin).toBeGreaterThan(0);
    expect(seedProfile.salaryMax).toBeGreaterThanOrEqual(seedProfile.salaryMin!);
  });

  it('should have initial target jobs with valid match scores', () => {
    expect(seedJobs.length).toBeGreaterThan(0);
    for (const job of seedJobs) {
      expect(job.company).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.matchScore).toBeGreaterThanOrEqual(0);
      expect(job.matchScore).toBeLessThanOrEqual(100);
      expect(['remote', 'hybrid', 'onsite']).toContain(job.locationType);
    }
  });

  it('should have applications with valid pipeline statuses', () => {
    const validStatuses: AppStatus[] = ['draft', 'applied', 'responded', 'interviewing', 'offered', 'rejected'];
    for (const app of seedApplications) {
      expect(validStatuses).toContain(app.status);
      expect(app.company).toBeTruthy();
      expect(app.role).toBeTruthy();
    }
  });

  it('should support all standard global currencies', () => {
    const currencyCodes = CURRENCIES.map(c => c.code);
    expect(currencyCodes).toContain('USD');
    expect(currencyCodes).toContain('EUR');
    expect(currencyCodes).toContain('GBP');
    expect(currencyCodes).toContain('INR');
    expect(currencyCodes).toContain('CAD');
    expect(currencyCodes).toContain('AUD');
    expect(currencyCodes).toContain('JPY');
  });
});
