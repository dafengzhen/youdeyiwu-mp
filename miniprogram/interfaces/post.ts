import { type IBase } from './index';
import { type ISection } from './section';

export interface IPost extends IBase {
  name: string;
  cover?: string;
  overview?: string;
  contentUpdatedOn: string;
  statement?: string;
  customTags: string[];
  images?: string[];
  highlights: string[];
  details: IPostDetails;
  section: ISection;
  _fromNow?: string;
}

export interface IPostDetails extends IBase {
  reviewStatus: TPostReviewStatus;
  sortStatus: TPostSortStatus;
  otherStatus: TPostOtherStatus;
  reviewReason?: string;
  sortReason?: string;
  otherReason?: string;
  viewCount: number;
  commentCount: number;
  replyCount: number;
  likeCount: number;
  followCount: number;
  favoriteCount: number;
  _commentTotalText?: string;
  _replyTotalText?: string;
  _viewTotalText?: string;
}

export type TPostReviewStatus =
  | 'AWAITING'
  | 'VERIFYING'
  | 'FAILED'
  | 'VERIFIED';

export type TPostSortStatus =
  | 'GLOBAL	'
  | 'LOCAL'
  | 'RECOMMEND'
  | 'POPULAR'
  | 'DEFAULT';

export type TPostOtherStatus =
  | 'DEFAULT'
  | 'LOCKING'
  | 'CLOSE'
  | 'ALLOW'
  | 'BLOCK'
  | 'NO_COMMENT'
  | 'NO_REPLY'
  | 'NO_COMMENT_REPLY';
