import type { IPagination, TBody, TParams } from '@/interfaces';
import request from '@tools/request';
import {
  type IPost,
  type IPostClientDetails,
  type IPostEditInfo,
  type IPostFavourite,
  type IPostNewInfo,
} from '@interfaces/post';
import uploadRequest from '@tools/uploadRequest';

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

export const uploadPostNewFile = async (
  params: TBody<{
    filePath: string;
  }>
): Promise<string> => {
  return await uploadRequest({
    url: '/file/posts/new',
    name: 'file',
    filePath: params.data!.filePath,
  });
};

export const uploadPostContent = async (
  params: TBody<{
    filePath: string;
  }>
): Promise<string> => {
  return await uploadRequest({
    url: `/file/posts/${params.id as string}/content`,
    name: 'file',
    filePath: params.data!.filePath,
  });
};

export const queryPostNewInfo = async (): Promise<IPostNewInfo> => {
  return await request.get('/forum/posts/new');
};

export const queryPostEditInfo = async (
  params: TParams
): Promise<IPostEditInfo> => {
  return await request.get(`/forum/posts/${params.id as string}/edit`);
};

export const updatePostNewInfo = async (
  params: TBody<{
    name: string;
    content: string;
    sectionId: number;
    cover?: string;
    overview?: string;
    statement?: string;
    customTags?: string[];
    otherStatus?: string;
    secret?: string;
  }>
): Promise<void> => {
  await request.post('/forum/posts/new', params.data);
};

export const updatePostEditInfo = async (
  params: TBody<{
    sectionId?: number;
    name?: string;
    cover?: string;
    overview?: string;
    content?: string;
    statement?: string;
    customTags?: string[];
    otherStatus?: string;
    secret?: string;
  }>
): Promise<void> => {
  await request.put(`/forum/posts/${params.id as string}/edit`);
};
