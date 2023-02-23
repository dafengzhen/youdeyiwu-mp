import type { IBase } from '@/interfaces';

export interface IReplyBase extends IBase {
  content: string;
  likeCount: number;
  reviewReason?: string;
  reviewStatus: 'AWAITING' | 'VERIFYING' | 'FAILED' | 'VERIFIED';
  _fromNow?: string;
}

export interface IReply extends IReplyBase {
  emptyParentReplyList?: boolean;
}

export interface IParentReply extends IReplyBase {
  emptyChildReplyList?: boolean;
}

export interface IChildReply extends IReplyBase {}
