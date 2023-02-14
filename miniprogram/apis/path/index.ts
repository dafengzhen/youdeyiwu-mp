import request from '@/tools/request';
import { type TParams } from '@/interfaces';
import { type IPath } from '@interfaces/path';

export const queryPath = async (
  params: TParams = { query: { name: '/' } }
): Promise<IPath> => {
  return await request.get('/paths', { params: params.query });
};
