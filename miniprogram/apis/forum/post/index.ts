import type { IPagination, TParams } from '../../../interfaces';
import request from '@tools/request';
import { type IPost } from '../../../interfaces/post';

export const clientQueryAllPost = async (
  params: TParams = {}
): Promise<IPagination<IPost>> => {
  return await request.get('/forum/posts/client', { params: params.query });
};

export const queryPostRandom = async (
  params: TParams = {}
): Promise<IPost[]> => {
  return await request.get('/forum/posts/random', { params: params.query });
};
