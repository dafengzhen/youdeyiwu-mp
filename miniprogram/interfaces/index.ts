import { type IUserOv } from '@interfaces/user';
import { type IPath } from '@interfaces/path';

export interface TParams {
  id?: string | number;
  query?: object;
}

export interface TBody<T> {
  id?: string | number;
  data?: T;
}

export interface IBase extends IExtra {
  id: number;
  createdBy?: number;
  updatedBy?: number;
  creatorAlias?: string;
  updaterAlias?: string;
  createdOn: string;
  updatedOn: string;
  deleted: boolean;
}

export interface IExtra {
  user?: IUserOv;
}

export interface IPageable {
  next: boolean;
  page: number;
  pages: number;
  previous: boolean;
  size: number;
  keyset?: IKeySet;
}

export interface IPagination<T> {
  content: T[];
  pageable: IPageable;
}

export interface IKeySet {
  lowest: [];
  highest: [];
}

export interface IApp {
  globalData: IPath | Record<string, any>;
}

export interface IToken {
  id: number;
  alias: string;
  token: string;
  refreshToken: string;
}
