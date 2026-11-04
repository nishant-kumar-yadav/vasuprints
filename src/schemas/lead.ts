/** Client-safe lead constants (the Mongoose model re-exports these). */
export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'skipped';
