import request from '@/tools/request';
import { type IToken, type TBody } from '@/interfaces';
import uploadRequest from '@tools/uploadRequest';

export const weixinMpUserLoginByPhone = async (
  params: TBody<{
    loginCode: string;
    code: string;
  }>
): Promise<IToken> => {
  return await request.post('/weixin/mp/phone', params.data);
};

export const uploadWeixinMpAvatarFile = async (
  params: TBody<{
    avatarUrl: string;
    token: string;
  }>
): Promise<string> => {
  return await uploadRequest({
    url: '/file/weixin/mp/avatar',
    name: 'file',
    filePath: params.data!.avatarUrl,
    token: params.data!.token,
  });
};

export const updateWeixinMpUserInfo = async (
  params: TBody<{
    avatarUrl?: string;
    alias?: string;
  }>
): Promise<void> => {
  await request.put(`/weixin/mp/${params.id as string}/info`, params.data);
};
