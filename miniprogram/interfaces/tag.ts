import { type IBase } from '@interfaces/index';
import { type ITagGroup } from '@interfaces/taggroup';

export interface ITag extends IBase {
  id: number;
  name: string;
  tagGroups?: ITagGroup[];
}
