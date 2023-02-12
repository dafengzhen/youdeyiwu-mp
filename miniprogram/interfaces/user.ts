import { type IRole } from './role';
import { type IBase } from './index';

export interface IUser extends IBase {
  alias?: string;
  username?: string;
  phone?: string;
  email?: string;
  qqOpenId?: string;
  qqUnionId?: string;
  wxOpenId?: string;
  wxUnionId?: string;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  accountNonLocked: boolean;
  enabled: boolean;
  lastLoginTime: string;
  details?: IUserDetails;
}

export interface IUserBasicInfo extends IBase {
  alias: string;
  username: string;
  lastLoginTime: string;
  details: IUserDetails;
}

export interface IUserDetails extends IBase {
  personalizedSignature?: string;
  smallAvatarUrl?: string;
  mediumAvatarUrl?: string;
  largeAvatarUrl?: string;
  contacts?: IContact[];
  about?: string;
}

export interface IUserOv {
  id: number;
  alias: string;
  details: {
    personalizedSignature?: string;
    smallAvatarUrl?: string;
    mediumAvatarUrl?: string;
    largeAvatarUrl?: string;
    contacts?: IContact[];
    about?: string;
    _avatarUrl?: string;
  };
  roles: IRole[];
  statistic: {
    posts: number;
    sections: number;
    tags: number;
    comments: number;
    replies: number;
    views: number;
  };
}

export interface IContact {
  id: string;
  key: string;
  val: string;
}
