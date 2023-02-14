import { type TParams } from '@/interfaces';
import request from '@tools/request';
import { type ISectionClient, type ISectionDetails } from '@interfaces/section';

export const clientQueryAllSection = async (
  params: TParams = {}
): Promise<ISectionClient[]> => {
  return await request.get('/forum/sections/client', { params: params.query });
};

export const clientQuerySectionDetailsById = async (
  params: TParams
): Promise<ISectionDetails> => {
  return await request.get(
    `/forum/sections/client/${params.id as string}/details`,
    {
      params: params.query,
    }
  );
};
