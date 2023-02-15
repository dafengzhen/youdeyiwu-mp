import request from '@/tools/request';
import { type TParams } from '@/interfaces';
import { type IUserClientDetails } from '@interfaces/user';

export const clientQueryUserDetails = async (
  params: TParams
): Promise<IUserClientDetails> => {
  return await request.get(`/users/client/${params.id as string}/details`, {
    params: params.query,
  });
};
