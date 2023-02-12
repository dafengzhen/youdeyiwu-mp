import { type IBase } from './index';

export interface IRole extends IBase {
  name: string;
  sort: number;
  hide: boolean;
}
