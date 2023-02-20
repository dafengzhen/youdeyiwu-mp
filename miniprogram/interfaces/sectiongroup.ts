import { type IBase } from '@interfaces/index';
import { type ISection } from '@interfaces/section';

export interface ISectionGroup extends IBase {
  name: string;
  sort: number;
  sections?: ISection[];
}
