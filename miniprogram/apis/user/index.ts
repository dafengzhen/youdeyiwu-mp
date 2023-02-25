import request from '@/tools/request';
import { type TBody, type TParams } from '@/interfaces';
import { type IUserClientDetails } from '@interfaces/user';
import uploadRequest from '@tools/uploadRequest';

export const clientQueryUserDetails = async (
  params: TParams
): Promise<IUserClientDetails> => {
  return await request.get(`/users/client/${params.id as string}/details`, {
    params: params.query,
  });
};

export const logout = async (): Promise<void> => {
  await request.get('/logout');
};

export const uploadAvatarFile = async (
  params: TBody<{
    avatarUrl: string;
  }>
): Promise<string> => {
  return await uploadRequest({
    url: '/file/users/avatar',
    name: 'file',
    filePath: params.data!.avatarUrl,
  });
};
