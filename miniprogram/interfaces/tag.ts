import { type IBase } from './index';
import { type ITagGroup } from './taggroup';

export interface ITag extends IBase {
  id: number;
  name: string;
  tagGroups?: ITagGroup[];
}
