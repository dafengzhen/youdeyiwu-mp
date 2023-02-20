import { type IBase } from '@interfaces/index';
import { type ITag } from '@interfaces/tag';

export interface ITagGroup extends IBase {
  name: string;
  sort: number;
  tags?: ITag[];
}
