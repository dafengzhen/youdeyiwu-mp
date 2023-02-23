import type { TBody } from '@/interfaces';
import request from '@tools/request';

export const createComment = async (
  params: TBody<{ postId: number; content: string }>
): Promise<void> => {
  await request.post('/forum/comments', params.data);
};
