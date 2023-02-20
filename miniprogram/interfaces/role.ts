import { type IBase } from '@interfaces/index';

export interface IRole extends IBase {
  name: string;
  sort: number;
  hide: boolean;
}
