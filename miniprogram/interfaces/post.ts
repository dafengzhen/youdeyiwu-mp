import {
  type IBase,
  type IPageable,
  type IPagination,
} from '@interfaces/index';
import { type ISection } from '@interfaces/section';
import { type IUserOv } from '@interfaces/user';
import { type IComment } from '@interfaces/comment';
import { type IReply } from '@interfaces/reply';

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
  _commentReplyTotalText?: string;
  _viewTotalText?: string;
  _likeTotalText?: string;
  _favoriteTotalText?: string;
  _followTotalText?: string;
}

export interface IPostClientDetails {
  user: IUserOv;
  basic: IPost;
  content: string;
  details: IPostDetails;
  section: ISection;
  data: IPagination<IPostComment>;
  isLike: boolean;
  isFollow: boolean;
  isFavourite: boolean;
}

export interface IPostComment {
  _postId: number;
  _commentId: number;
  _commentIndex: number;
  user: IUserOv;
  comment: IComment;
  pageable: IPageable;
  content: IPostCommentReply[];
}

export interface IPostCommentReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  user: IUserOv;
  reply: IReply;
  pageable: IPageable;
  content: IPostCommentParentReply[];
}

export interface IPostCommentParentReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  _parentReplyId: number;
  _parentReplyIndex: number;
  user: IUserOv;
  reply: IReply;
  pageable: IPageable;
  content: IPostCommentChildReply[];
}

export interface IPostCommentChildReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  _parentReplyId: number;
  _parentReplyIndex: number;
  _childReplyId: number;
  _childReplyIndex: number;
  _parentReplyUser: IUserOv;
  user: IUserOv;
  reply: IReply;
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

export interface IPostFavourite extends IBase {
  name: string;
  remark?: string;
  postId: number;
}
