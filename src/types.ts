export type NavPage = 'dashboard' | 'jobs' | 'applications' | 'generator' | 'profile' | 'settings';

export type AppStatus = 'draft' | 'applied' | 'responded' | 'interviewing' | 'offered' | 'rejected';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'CHF';

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export interface CandidateProfile {
  uid: string;
  name: string;
  email: string;
  title: string;
  avatarUrl?: string;
  targetRoles: string[];
  skills: string[];
  preferredLocations: string[];
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: Currency;
  experienceYears: number;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  resumeFile?: {
    name: string;
    size: string;
    uploadedAt: string;
    dataUrl?: string;
  };
  resumeText?: string;
}

export interface JobListing {
  jobId: string;
  ownerId: string;
  company: string;
  companyLogo?: string;
  title: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: Currency;
  url: string;
  description: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  addedAt: string;
}

export interface JobApplication {
  applicationId: string;
  ownerId: string;
  jobId: string;
  company: string;
  companyLogo?: string;
  role: string;
  resumeBullets: string[];
  coverLetter: string;
  outreachMessage: string;
  status: AppStatus;
  appliedAt: string | null;
  needsFollowUp: boolean;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

export interface ActivityEntry {
  id: string;
  type: 'applied' | 'generated' | 'status_change' | 'follow_up' | 'job_added';
  company: string;
  role: string;
  detail: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  type: 'follow_up' | 'status' | 'match' | 'info';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}
