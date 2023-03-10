import HideLoadingOption = WechatMiniprogram.HideLoadingOption;
import HideToastOption = WechatMiniprogram.HideToastOption;
import ShowLoadingOption = WechatMiniprogram.ShowLoadingOption;
import ShowToastOption = WechatMiniprogram.ShowToastOption;
import GeneralCallbackResult = WechatMiniprogram.GeneralCallbackResult;
import ShowModalOption = WechatMiniprogram.ShowModalOption;
import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;
import OnBackgroundFetchDataListenerResult = WechatMiniprogram.OnBackgroundFetchDataListenerResult;
import GetBackgroundFetchDataOption = WechatMiniprogram.GetBackgroundFetchDataOption;
import GetBackgroundFetchDataSuccessCallbackResult = WechatMiniprogram.GetBackgroundFetchDataSuccessCallbackResult;
import Constants from '@/constants';
import zhCN from 'date-fns/locale/zh-CN';
import { atob } from 'js-base64';
import { format, formatDistanceStrict, isAfter } from 'date-fns';
import { type IApp, type IPagination } from '@/interfaces';
import diff from 'microdiff';

export const showToast = async (
  options: ShowToastOption = { title: 'ok' }
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showToast({
      icon: 'none',
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const hideToast = async (
  options: HideToastOption = {}
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.hideToast({
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const showLoading = async (
  options: ShowLoadingOption = { title: '正在加载...' }
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showLoading({
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const hideLoading = async (
  options: HideLoadingOption = {}
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.hideLoading({
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const showModal = async (
  options: ShowModalOption = { title: 'ok', content: 'ok' }
): Promise<ShowModalSuccessCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showModal({
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const hasText = (value: string | undefined | null): boolean => {
  return typeof value === 'string' && value.trim().length > 1;
};

export const isHttpOrHttps = (value: string): boolean => {
  return value.startsWith('http') || value.startsWith('https');
};

export const fromNow = (datetime: string): string => {
  return formatDistanceStrict(new Date(), new Date(datetime), {
    locale: zhCN,
  });
};

export const formatTotal = (total: number): string => {
  if (total < 900) {
    return total + '';
  } else {
    return '999+';
  }
};

export const parseError = (
  e: any
): { message: string; status: number; code?: number } => {
  let error = {
    message: '未知错误',
    status: 500,
  };

  if (e instanceof Error) {
    const message = e.message;
    try {
      const reason = JSON.parse(message);
      if ('data' in reason) {
        error = {
          ...error,
          ...reason.data,
        };
      } else {
        error = {
          ...error,
          ...reason,
        };
      }
    } catch (e: any) {
      error.message =
        message ||
        (typeof e === 'object' ? e.message ?? '解析错误实例发生错误' : e);
    }
  } else if (typeof e === 'string') {
    error.message = e;
  } else if (typeof e === 'object') {
    error = {
      ...error,
      ...e,
      message: e.message ?? e.errMsg ?? error.message,
    };
  } else {
    error.message = e + '';
  }

  return error;
};

export const defaultPagination = (): IPagination<any> => {
  return {
    content: [],
    pageable: {
      next: false,
      page: 0,
      pages: 0,
      previous: false,
      size: 0,
    },
  };
};

export const simplifyYearMonth = (date: string): string => {
  const currentDate = new Date(date);
  const newDate = new Date();
  let _format = 'MM/dd';
  if (currentDate.getFullYear() !== newDate.getFullYear()) {
    _format = 'yyyy/MM/dd';
  }
  return format(new Date(date), _format);
};

export const decodeToken = (
  value: string
): {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  jti?: string;
  nbf?: number;
  exp?: number;
  iat?: number;
  [propName: string]: unknown;
} => {
  return JSON.parse(atob(value));
};

export const setStorageSync = (key: string, data: any, time?: Date): void => {
  try {
    wx.setStorageSync(key, {
      data,
      time,
    });
  } catch (e) {
    console.error(e);
    void showToast({ title: '小程序保存数据失败' });
  }
};

export const getStorageSync = (key: string): any => {
  try {
    const storage = wx.getStorageSync(key);
    const time = storage.time;
    if (time) {
      if (isAfter(new Date(time), new Date())) {
        return storage.data;
      } else {
        wx.removeStorageSync(key);
        return;
      }
    }
    return storage.data;
  } catch (e) {
    console.error(e);
    void showToast({ title: '小程序获取数据失败' });
  }
};

export const removeStorageSync = (key: string): void => {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error(e);
    void showToast({ title: '小程序删除数据失败' });
  }
};

export const checkTicket = (code: number): void => {
  if (code === 4010 || code === 4011) {
    removeStorageSync(Constants.TICKET);
  }
};

export const generateRandomNum = (n: number): string => {
  let num = '';
  for (let i = 0; i < n; i++) {
    const id = Math.ceil(Math.random() * 35);
    num += Constants.NUMS[id];
  }
  return num;
};

export const uniqBy = (array: any[] = [], by: string): any[] => {
  return array.reduce((previousValue, currentValue) => {
    if (!previousValue.find((item: any) => item[by] === currentValue[by])) {
      previousValue.push(currentValue);
    }
    return previousValue;
  }, []);
};

export const setNavQueryStrings = (app: IApp, query = {}): void => {
  const queryStrings = app.globalData._queryStrings ?? {};
  app.globalData._queryStrings = { ...queryStrings, ...query };
};

export const getNavQueryStrings = (app: IApp, key: string): any => {
  const queryStrings = app.globalData._queryStrings ?? {};
  const _value = queryStrings[key];
  queryStrings[key] = undefined;
  return _value;
};

export const hasNavQueryStrings = (app: IApp, key: string): boolean => {
  const queryStrings = app.globalData._queryStrings ?? {};
  return !!queryStrings[key];
};

export const filterParams = (params: any = {}): any => {
  const _params: any = {};
  for (const paramsKey in params) {
    if (
      params[paramsKey] !== null &&
      params[paramsKey] !== undefined &&
      params[paramsKey] !== ''
    ) {
      _params[paramsKey] = params[paramsKey];
    }
  }
  return _params;
};

export const getToken = (defaultValue?: undefined | any): string => {
  return (
    getStorageSync(Constants.TICKET)?.token ??
    (typeof defaultValue !== 'undefined' ? defaultValue : undefined)
  );
};

export const onBackgroundFetchData =
  async (): Promise<OnBackgroundFetchDataListenerResult> => {
    return await new Promise((resolve, reject) => {
      try {
        wx.onBackgroundFetchData(resolve);
      } catch (e) {
        reject(e);
      }
    });
  };

export const getBackgroundFetchData = async (
  options: GetBackgroundFetchDataOption & { fetchType: 'pre' | 'periodic' }
): Promise<GetBackgroundFetchDataSuccessCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.getBackgroundFetchData({
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
      ...options,
    });
  });
};

export const diffData = (
  obj: Record<string, any> | any[],
  newObj: Record<string, any> | any[],
  options?: Partial<{ cyclesFix: boolean }>,
  _stack?: Array<Record<string, any>>
): Record<string, any> => {
  return diff(obj, newObj, options, _stack)
    .filter((item) => item.type === 'CREATE' || item.type === 'CHANGE')
    .reduce<Record<string, any>>((previousValue, currentValue) => {
      currentValue.path.forEach((value) => {
        const _value = (currentValue as any).value;
        if (hasText(_value)) {
          previousValue[value] = (currentValue as any).value;
        }
      });
      return previousValue;
    }, {});
};

export const dataChunk = (
  array: any[] = [],
  perChunk: number = 10
): unknown[][] => {
  return array.reduce<any>((previousValue, currentValue, currentIndex) => {
    const index = Math.floor(currentIndex / perChunk);
    previousValue[index] = [].concat(previousValue[index] || [], currentValue);
    return previousValue;
  }, []);
};

export const to1DArray = (array: any[][] = []): unknown[] => {
  return array.reduce(
    (previousValue, currentValue) => previousValue.concat(currentValue),
    []
  );
};
