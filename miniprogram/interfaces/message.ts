import { type IBase } from './index';

export interface IMessage extends IBase {
  name: string;
  content: string;
  messageType: TMessageTypeEnum;
  messageRange: TMessageRange;
  businessId: number;
  businessName: string;
  businessRemark: string;
  sender: number;
  recipient: number;
  senderAlias?: string;
  recipientAlias?: string;
}

export interface IClientMessage extends IBase {
  name: string;
  overview?: string;
  _overview?: string;
  content: string;
  _content?: object;
  messageType: TMessageTypeEnum;
  messageRange: TMessageRange;
  messageStatus?: TMessageStatus;
  _createdOn?: string;
  _builtInStatic?: boolean;
}

export type TMessageTypeEnum =
  | 'SYSTEM'
  | 'OTHER'
  | 'STATUS'
  | 'LOGIN'
  | 'REGISTER'
  | 'LOGOUT'
  | 'USER'
  | 'ROLE'
  | 'PERMISSION'
  | 'SECTION'
  | 'POST'
  | 'TAG'
  | 'COMMENT'
  | 'REPLY'
  | 'OAUTH_CLIENT'
  | 'OAUTH_CLIENT_API';

export type TMessageRange = 'ALL' | 'USER';

export type TMessageStatus = 'UNREAD' | 'HAVE_READ';
