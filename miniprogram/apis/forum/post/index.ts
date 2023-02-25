import type { IPagination, TBody, TParams } from '@/interfaces';
import request from '@tools/request';
import {
  type IPost,
  type IPostClientDetails,
  type IPostFavourite,
} from '@interfaces/post';

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

export const clientQueryPostDetails = async (
  params: TParams = {}
): Promise<IPostClientDetails> => {
  return await request.get(
    `/forum/posts/client/${params.id as string}/details`,
    { params: params.query }
  );
};

export const postLike = async (params: TParams): Promise<void> => {
  await request.get(`/forum/posts/${params.id as string}/like`);
};

export const postCancelLike = async (params: TParams): Promise<void> => {
  await request.delete(`/forum/posts/${params.id as string}/like`);
};

export const createFollow = async (params: TBody<void>): Promise<void> => {
  await request.post(`/forum/posts/${params.id as string}/follow/add`);
};

export const removeFollow = async (params: TParams): Promise<void> => {
  await request.delete(`/forum/posts/${params.id as string}/follow/remove`);
};

export const postFollow = async (params: TParams): Promise<void> => {
  await request.get(`/forum/posts/${params.id as string}/follow`);
};

export const postCancelFollow = async (params: TParams): Promise<void> => {
  await request.delete(`/forum/posts/${params.id as string}/follow`);
};

export const createFavourite = async (params: TBody<void>): Promise<void> => {
  await request.post(`/forum/posts/${params.id as string}/favourite/add`);
};

export const removeFavourite = async (params: TParams): Promise<void> => {
  await request.delete(`/forum/posts/${params.id as string}/favourite/remove`);
};

export const postFavourite = async (params: TParams): Promise<void> => {
  await request.get(`/forum/posts/${params.id as string}/favourite`);
};

export const postCancelFavourite = async (params: TParams): Promise<void> => {
  await request.delete(`/forum/posts/${params.id as string}/favourite`);
};

export const postView = async (params: TBody<void>): Promise<void> => {
  await request.post(`/forum/posts/${params.id as string}/view`);
};

export const queryPostFavourites = async (): Promise<IPostFavourite[]> => {
  return await request.get('/forum/posts/favourites');
};
