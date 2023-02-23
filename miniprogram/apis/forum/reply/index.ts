import { type TBody, type TParams } from '@/interfaces';
import request from '@tools/request';
import {
  type IPostComment,
  type IPostCommentParentReply,
  type IPostCommentReply,
} from '@interfaces/post';

export const createReply = async (
  params: TBody<{
    commentId: number;
    content: string;
  }>
): Promise<void> => {
  await request.post('/forum/replies', params.data);
};

export const queryAllReplyByCommentId = async (
  params: TParams
): Promise<IPostComment> => {
  return await request.get(`/forum/replies/comments/${params.id as string}`, {
    params: params.query,
  });
};

export const queryAllParentReplyByReplyId = async (
  params: TParams
): Promise<IPostCommentReply> => {
  return await request.get(`/forum/replies/${params.id as string}/parent`, {
    params: params.query,
  });
};

export const queryAllChildReplyByParentReplyId = async (
  params: TParams
): Promise<IPostCommentParentReply> => {
  return await request.get(`/forum/replies/${params.id as string}/child`, {
    params: params.query,
  });
};

export const createParentReply = async (
  params: TBody<{
    replyId: number;
    content: string;
  }>
): Promise<void> => {
  await request.post('/forum/replies/parent', params.data);
};

export const createChildReply = async (
  params: TBody<{
    parentReplyId: number;
    content: string;
  }>
): Promise<void> => {
  await request.post('/forum/replies/child', params.data);
};
