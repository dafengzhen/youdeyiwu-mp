import { type IBase, type IPagination } from '.';
import { type ISectionGroup } from '@interfaces/sectiongroup';
import { type IUser } from '@interfaces/user';
import { type ITag } from '@interfaces/tag';
import { type ITagGroup } from '@interfaces/taggroup';
import { type IPost } from '@interfaces/post';

export interface ISection extends IBase {
  id: number;
  cover?: string;
  name: string;
  status: ISectionStatus;
  overview?: string;
  sort: number;
}

export interface ISectionClient extends ISection {
  postCount: number;
  tagCount: number;
  sectionGroup?: ISectionGroup;
  admins: IUser[];
  tags: ITag[];
  _index?: number;
  _loaded?: boolean;
  _customized?: boolean;
}

export interface ISectionDetails {
  basic: ISection;
  content?: string;
  tagGroups?: ITagGroup[];
  sectionGroup?: ISectionGroup;
  tags: ITag[];
  admins: IUser[];
  data?: IPagination<IPost>;
}

export type ISectionStatus =
  | 'DEFAULT'
  | 'LOCKING'
  | 'CLOSE'
  | 'ALLOW'
  | 'BLOCK';
