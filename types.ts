export enum PostTone {
  PROFESSIONAL = 'Profesional',
  FRIENDLY = 'Amistoso',
  HUMOROUS = 'Humorístico',
  INSPIRATIONAL = 'Inspirador',
  PROMOTIONAL = 'Promocional',
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export enum PostStatus {
  SCHEDULED = 'scheduled',
  PAUSED = 'paused',
  PUBLISHED = 'published',
}

export interface ScheduledPost {
  id: string;
  topic: string;
  tone: PostTone;
  cta: string;
  content: string;
  imageSource: string | null;
  pageId: string;
  pageName: string;
  pageToken: string;
  scheduledAt: string; // ISO string
  status: PostStatus;
}
