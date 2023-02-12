import { type IUserOv } from './user';
import { type IPath } from './path';

export interface TParams {
  id?: string | number;
  query?: object;
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
