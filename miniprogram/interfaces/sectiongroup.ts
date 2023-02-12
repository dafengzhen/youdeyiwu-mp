import { type IBase } from './index';
import { type ISection } from './section';

export interface ISectionGroup extends IBase {
  name: string;
  sort: number;
  sections?: ISection[];
}
