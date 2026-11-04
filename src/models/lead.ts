import mongoose, { Schema, type Model } from 'mongoose';

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface LeadDoc {
  _id: mongoose.Types.ObjectId;
  reference: string;
  kind: 'quote' | 'message';
  status: LeadStatus;
  customer: { name: string; company: string; phone: string; email: string };
  request: {
    categorySlug: string;
    categoryName: string;
    productSlug: string | null;
    productName: string | null;
    size: string;
    quantity: string;
    material: string;
    finishing: string;
    deliveryCity: string;
    deliveryState: string;
    additional: string;
  };
  files: string[];
  source: { landingPage: string; submitPage: string; utmSource: string; utmMedium: string; utmCampaign: string };
  consent: { accepted: true; noticeVersion: string; at: Date };
  email: {
    admin: { status: EmailStatus; at?: Date; error?: string };
    customer: { status: EmailStatus; at?: Date; error?: string };
  };
  notes: { body: string; at: Date }[];
  statusHistory: { from: LeadStatus; to: LeadStatus; at: Date }[];
  meta: { ipHash: string; userAgent: string };
  createdAt: Date;
  updatedAt: Date;
}

const delivery = new Schema({ status: String, at: Date, error: String }, { _id: false, strict: 'throw' });

const leadSchema = new Schema<LeadDoc>(
  {
    reference: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['quote', 'message'], default: 'quote' },
    status: { type: String, enum: LEAD_STATUSES, default: 'new' },
    customer: { name: String, company: String, phone: String, email: String },
    request: {
      categorySlug: String,
      categoryName: String,
      productSlug: { type: String, default: null },
      productName: { type: String, default: null },
      size: String,
      quantity: String,
      material: String,
      finishing: String,
      deliveryCity: String,
      deliveryState: String,
      additional: String,
    },
    files: [String],
    source: { landingPage: String, submitPage: String, utmSource: String, utmMedium: String, utmCampaign: String },
    consent: { accepted: Boolean, noticeVersion: String, at: Date },
    email: { admin: delivery, customer: delivery },
    notes: [new Schema({ body: String, at: Date }, { _id: false, strict: 'throw' })],
    statusHistory: [new Schema({ from: String, to: String, at: Date }, { _id: false, strict: 'throw' })],
    meta: { ipHash: String, userAgent: String },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 'customer.phone': 1 });
leadSchema.index({ reference: 'text', 'customer.name': 'text', 'customer.company': 'text', 'customer.email': 'text' });

export interface UploadDoc {
  _id: string;
  originalName: string;
  ext: string;
  detectedMime: string;
  bytes: number;
  sha256: string;
  storagePath: string;
  status: 'pending' | 'attached';
  leadId: mongoose.Types.ObjectId | null;
  ipHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema<UploadDoc>(
  {
    _id: { type: String, required: true },
    originalName: String,
    ext: String,
    detectedMime: String,
    bytes: Number,
    sha256: String,
    storagePath: String,
    status: { type: String, enum: ['pending', 'attached'], default: 'pending' },
    leadId: { type: Schema.Types.ObjectId, default: null },
    ipHash: String,
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
uploadSchema.index({ status: 1, createdAt: 1 });
uploadSchema.index({ leadId: 1 });

const counterSchema = new Schema({ _id: String, seq: Number }, { versionKey: false, strict: 'throw' });

export const LeadModel: Model<LeadDoc> = (mongoose.models.Lead as Model<LeadDoc>) ?? mongoose.model<LeadDoc>('Lead', leadSchema);
export const UploadModel: Model<UploadDoc> =
  (mongoose.models.Upload as Model<UploadDoc>) ?? mongoose.model<UploadDoc>('Upload', uploadSchema);
export const CounterModel =
  (mongoose.models.Counter as Model<{ _id: string; seq: number }>) ??
  mongoose.model<{ _id: string; seq: number }>('Counter', counterSchema);
