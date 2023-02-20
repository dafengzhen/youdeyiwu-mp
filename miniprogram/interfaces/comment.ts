import type { IBase } from '@/interfaces';

export interface IComment extends IBase {
  content: string;
  likeCount: number;
  status: 'DEFAULT' | 'LOCKING' | 'POST_VISIBLE';
  secret?: string;
  reviewReason?: string;
  reviewStatus: 'AWAITING' | 'VERIFYING' | 'FAILED' | 'VERIFIED';
}
