import { type IBase } from './index';
import { type ITag } from './tag';

export interface ITagGroup extends IBase {
  name: string;
  sort: number;
  tags?: ITag[];
}
