import type { IPagination, TParams } from '@/interfaces';
import request from '@/tools/request';
import { type IClientMessage } from '@interfaces/message';

export const queryAllMessage = async (
  params: TParams = {}
): Promise<IPagination<IClientMessage>> => {
  return await request.get('/messages', {
    params: params.query,
  });
};
