import { CandidateProfile, JobListing, JobApplication, ActivityEntry } from '../types';

/* ─── Seed Profile ─── */
export const seedProfile: CandidateProfile = {
  uid: 'demo_user_01',
  name: 'Nadia Rachel',
  email: 'nadia.rachel@gmail.com',
  title: 'Senior Frontend Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&auto=format&fit=crop&q=80',
  targetRoles: ['Senior Frontend Engineer', 'Full Stack Engineer', 'Staff Engineer', 'Engineering Lead'],
  skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Firebase', 'GraphQL', 'Tailwind CSS', 'Python', 'AWS'],
  preferredLocations: ['San Francisco, CA', 'Remote', 'New York, NY'],
  salaryMin: 145000,
  salaryMax: 195000,
  salaryCurrency: 'USD',
  experienceYears: 6,
  linkedinUrl: 'https://linkedin.com/in/nadia-rachel',
  portfolioUrl: 'https://nadiarachel.dev',
  summary: 'Experienced frontend engineer passionate about building accessible, performant, and delightful products. Led frontend architecture at two Y-Combinator startups with a focus on React, TypeScript, and real-time applications.',
  resumeFile: {
    name: 'Nadia_Rachel_Senior_Frontend_Resume.pdf',
    size: '245 KB',
    uploadedAt: '2026-08-01T10:00:00Z',
  },
  resumeText: `NADIA RACHEL — Senior Frontend Engineer
Email: nadia.rachel@gmail.com | Portfolio: nadiarachel.dev | LinkedIn: linkedin.com/in/nadia-rachel

SUMMARY
Senior Frontend Engineer with 6+ years specializing in React, TypeScript, Next.js, and real-time frontend architecture. Passionate about design systems, web performance, and developer experience.

EXPERIENCE
• Senior Frontend Engineer | HyperScale Tech (2023 – Present)
  - Architected and delivered core collaborative editor in React & TypeScript, boosting daily engagement by 35%.
  - Mentored 5 engineers and established company-wide frontend standards and CI/CD testing pipelines.
• Frontend Engineer | CloudFlow Inc. (2020 – 2023)
  - Built real-time analytics dashboard handling 5M+ monthly events with Next.js and WebSockets.
  - Reduced bundle size by 42% and improved Core Web Vitals across 8 product surfaces.

SKILLS
React, TypeScript, Next.js, Node.js, GraphQL, Tailwind CSS, Python, AWS, Jest, Playwright, WebSockets.`,
};

/* ─── Seed Jobs ─── */
export const seedJobs: JobListing[] = [
  {
    jobId: 'job_spotify',
    ownerId: 'demo_user_01',
    company: 'Spotify',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    title: 'Senior Frontend Engineer — Music Platform',
    location: 'Stockholm / Remote',
    locationType: 'remote',
    salaryMin: 165000,
    salaryMax: 195000,
    url: 'https://spotify.com/careers',
    description: 'Build the next generation of Spotify\'s web player, working with React, TypeScript, and modern Web APIs. Own core music playback and discovery UIs. Work closely with product and design on real-time user experiences.',
    matchScore: 94,
    matchReason: 'Strong match across React, TypeScript, and real-time UI experience. Frontend specialization aligns directly with this role.',
    matchedSkills: ['React', 'TypeScript', 'Next.js'],
    addedAt: '2026-08-01T10:00:00Z',
  },
  {
    jobId: 'job_stripe',
    ownerId: 'demo_user_01',
    company: 'Stripe',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    title: 'Staff Engineer — Developer Experience',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    salaryMin: 175000,
    salaryMax: 220000,
    url: 'https://stripe.com/jobs',
    description: 'Drive developer experience improvements for Stripe\'s dashboard and SDK documentation. Own architecture decisions for frontend platforms. Partner with product engineering and design systems teams.',
    matchScore: 87,
    matchReason: 'Excellent skills alignment. Engineering leadership and frontend architecture experience are strong signals.',
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    addedAt: '2026-08-03T09:30:00Z',
  },
  {
    jobId: 'job_vercel',
    ownerId: 'demo_user_01',
    company: 'Vercel',
    companyLogo: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    title: 'Senior Software Engineer — Next.js Core',
    location: 'Remote',
    locationType: 'remote',
    salaryMin: 160000,
    salaryMax: 190000,
    url: 'https://vercel.com/careers',
    description: 'Contribute to Next.js open-source and build features used by millions of developers. Focus on performance, edge runtime, and React Server Components.',
    matchScore: 91,
    matchReason: 'Direct Next.js expertise is a perfect match. Open-source and remote-first culture aligns with your preferences.',
    matchedSkills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
    addedAt: '2026-08-04T14:15:00Z',
  },
  {
    jobId: 'job_linear',
    ownerId: 'demo_user_01',
    company: 'Linear',
    companyLogo: 'https://linear.app/favicon.ico',
    title: 'Frontend Engineer — Product',
    location: 'Remote',
    locationType: 'remote',
    salaryMin: 155000,
    salaryMax: 180000,
    url: 'https://linear.app/careers',
    description: 'Build Linear\'s high-performance product management tool. Work on challenging frontend problems including real-time sync, keyboard-first navigation, and complex data visualization.',
    matchScore: 82,
    matchReason: 'Strong React and TypeScript background aligns. Real-time application experience is a major asset.',
    matchedSkills: ['React', 'TypeScript', 'GraphQL'],
    addedAt: '2026-08-05T11:00:00Z',
  },
  {
    jobId: 'job_figma',
    ownerId: 'demo_user_01',
    company: 'Figma',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
    title: 'Senior Engineer — Plugin Ecosystem',
    location: 'San Francisco, CA / Remote',
    locationType: 'hybrid',
    salaryMin: 170000,
    salaryMax: 210000,
    url: 'https://figma.com/careers',
    description: 'Build APIs and tooling to support Figma\'s thriving plugin ecosystem. Help developers create powerful integrations. Own the developer experience for 100K+ plugin developers.',
    matchScore: 78,
    matchReason: 'TypeScript and API design experience are relevant. The scale and impact potential are excellent.',
    matchedSkills: ['TypeScript', 'Node.js', 'AWS'],
    addedAt: '2026-08-06T16:30:00Z',
  },
];

/* ─── Seed Applications ─── */
export const seedApplications: JobApplication[] = [
  {
    applicationId: 'app_spotify',
    ownerId: 'demo_user_01',
    jobId: 'job_spotify',
    company: 'Spotify',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    role: 'Senior Frontend Engineer — Music Platform',
    resumeBullets: [
      'Architected and shipped Spotify Web Player\'s queue management UI, improving user engagement by 28%.',
      'Led migration of 45K LOC React codebase to TypeScript, eliminating a class of runtime bugs.',
      'Built real-time collaborative playlist features using WebSockets and Optimistic UI patterns.'
    ],
    coverLetter: `Dear Spotify Hiring Team,\n\nI'm excited to apply for the Senior Frontend Engineer role on the Music Platform team. With 6 years of experience building real-time, high-performance web applications in React and TypeScript, I've consistently delivered products that users love.\n\nAt my previous role, I led the frontend architecture of a music-adjacent consumer product, shipping a real-time listening experience to 500K+ users. I'm drawn to Spotify's mission to unlock the potential of human creativity, and I believe my background in building intuitive, accessible music UIs makes me a strong candidate.\n\nI'd love to bring this experience to Spotify's engineering team.\n\nBest,\nNadia Rachel`,
    outreachMessage: `Hi! I just applied for the Senior Frontend Engineer – Music Platform role at Spotify. I've spent 6 years shipping real-time React/TypeScript products and would love to bring that energy to Spotify. Would love to connect!`,
    status: 'interviewing',
    appliedAt: '2026-08-02T10:00:00Z',
    needsFollowUp: false,
    notes: 'Had a great first call with recruiter Sarah. Technical screen scheduled for Aug 10.',
    updatedAt: '2026-08-05T14:00:00Z',
    createdAt: '2026-08-02T10:00:00Z',
  },
  {
    applicationId: 'app_stripe',
    ownerId: 'demo_user_01',
    jobId: 'job_stripe',
    company: 'Stripe',
    companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    role: 'Staff Engineer — Developer Experience',
    resumeBullets: [
      'Designed and launched a component library used across 6 product surfaces, reducing design inconsistency by 70%.',
      'Mentored 4 senior engineers on frontend architecture best practices and TypeScript patterns.',
      'Owned developer experience tooling that improved local build times by 60% across the engineering organization.'
    ],
    coverLetter: `Dear Stripe Team,\n\nI'm applying for the Staff Engineer – Developer Experience position. I'm passionate about the craft of engineering tooling and developer productivity, having spent significant time in previous roles building component systems and developer-facing APIs.\n\nStripe's commitment to documentation, API design, and developer experience is something I deeply admire and want to contribute to.\n\nWarm regards,\nNadia Rachel`,
    outreachMessage: `Hello! I applied for the Staff Engineer – DX role at Stripe and wanted to reach out. I've built developer tooling and component libraries at scale and I'm a big fan of how Stripe approaches documentation and API design.`,
    status: 'applied',
    appliedAt: '2026-07-28T09:00:00Z',
    needsFollowUp: true, // > 7 days
    notes: '',
    updatedAt: '2026-07-28T09:00:00Z',
    createdAt: '2026-07-28T09:00:00Z',
  },
  {
    applicationId: 'app_vercel',
    ownerId: 'demo_user_01',
    jobId: 'job_vercel',
    company: 'Vercel',
    companyLogo: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
    role: 'Senior Software Engineer — Next.js Core',
    resumeBullets: [
      'Contributed 12 pull requests to open-source Next.js, including a performance improvement to image optimization pipeline.',
      'Built and deployed 8 production Next.js applications with ISR, SSR, and edge middleware patterns.',
      'Gave a conference talk on Next.js App Router migration strategies to an audience of 800 developers.'
    ],
    coverLetter: `Dear Vercel Team,\n\nNext.js has been central to my work for the past 4 years, and the opportunity to contribute to the core team is something I've long aspired to. I have production experience across every major paradigm Next.js supports and have contributed to the project open-source.\n\nBest,\nNadia Rachel`,
    outreachMessage: `Hi! I applied for the Next.js Core eng role and wanted to introduce myself. I've been shipping Next.js in production for 4 years and have open-source contributions to the framework. Would love to chat!`,
    status: 'responded',
    appliedAt: '2026-08-04T11:20:00Z',
    needsFollowUp: false,
    notes: 'Recruiter Priya reached out to schedule a call. Following up next week.',
    updatedAt: '2026-08-06T09:00:00Z',
    createdAt: '2026-08-04T11:20:00Z',
  },
  {
    applicationId: 'app_linear',
    ownerId: 'demo_user_01',
    jobId: 'job_linear',
    company: 'Linear',
    companyLogo: 'https://linear.app/favicon.ico',
    role: 'Frontend Engineer — Product',
    resumeBullets: [],
    coverLetter: '',
    outreachMessage: '',
    status: 'draft',
    appliedAt: null,
    needsFollowUp: false,
    notes: 'Need to customize cover letter and resume bullets.',
    updatedAt: '2026-08-06T15:00:00Z',
    createdAt: '2026-08-06T15:00:00Z',
  },
];

/* ─── Seed Activity Log ─── */
export const seedActivity: ActivityEntry[] = [
  { id: 'a1', type: 'status_change', company: 'Spotify', role: 'Senior Frontend Engineer', detail: 'Status changed to Interviewing', timestamp: '2026-08-05T14:00:00Z' },
  { id: 'a2', type: 'status_change', company: 'Vercel',  role: 'Next.js Core Engineer', detail: 'Recruiter responded — status updated', timestamp: '2026-08-06T09:00:00Z' },
  { id: 'a3', type: 'applied',       company: 'Stripe',  role: 'Staff Engineer — DX',   detail: 'Application submitted', timestamp: '2026-07-28T09:00:00Z' },
  { id: 'a4', type: 'follow_up',     company: 'Stripe',  role: 'Staff Engineer — DX',   detail: 'Flagged for follow-up (11 days since applying)', timestamp: '2026-08-07T08:00:00Z' },
  { id: 'a5', type: 'job_added',     company: 'Figma',   role: 'Senior Engineer — Plugin Ecosystem', detail: 'New job added to watchlist', timestamp: '2026-08-06T16:30:00Z' },
];
