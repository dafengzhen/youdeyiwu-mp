import { type IUserOv } from '@interfaces/user';

export interface IPath {
  imageConfig?: {
    enable: boolean;
    total: number;
    interval: string;
  };
  phoneConfig?: {
    enable: boolean;
    total: number;
    interval: string;
  };
  emailConfig?: {
    enable: boolean;
    total: number;
    interval: string;
  };
  qqConfig?: {
    enable: boolean;
  };
  clientConfig?: {
    showMenuEntry: boolean;
    doc: string;
    ywClientUrls: IYwOauthClientUrl[];
  };
  postOther?: {
    helpLink: string;
  };
  postConfig: { enableReview: boolean };
  siteConfig: {
    helpLink: string | undefined;
    feedbackLink: string | undefined;
    reportLink: string | undefined;
  };
  user?: IUserOv;
  _isQuickLogin?: boolean;
  _queryStrings?: {
    id?: any;
  };
}

export interface IYwOauthClientUrl {
  enable: boolean;
  clientId: string;
  clientName: string;
  clientLogo: string;
  url: string;
}
