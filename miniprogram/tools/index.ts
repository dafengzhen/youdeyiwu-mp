import HideLoadingOption = WechatMiniprogram.HideLoadingOption;
import HideToastOption = WechatMiniprogram.HideToastOption;
import ShowLoadingOption = WechatMiniprogram.ShowLoadingOption;
import ShowToastOption = WechatMiniprogram.ShowToastOption;
import GeneralCallbackResult = WechatMiniprogram.GeneralCallbackResult;
import ShowModalOption = WechatMiniprogram.ShowModalOption;
import ShowModalSuccessCallbackResult = WechatMiniprogram.ShowModalSuccessCallbackResult;
import Constants from '@/constants';
import zhCN from 'date-fns/locale/zh-CN';
import { atob } from 'js-base64';
import { format, formatDistanceStrict, isAfter } from 'date-fns';
import { type IPagination } from '@/interfaces';

export const showToast = async (
  options: ShowToastOption = { title: 'ok' }
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showToast({
      icon: 'none',
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: async (rea) => {
        reject(rea);
      },
    });
  });
};

export const hideToast = async (
  options: HideToastOption = {}
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.hideToast({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
    });
  });
};

export const showLoading = async (
  options: ShowLoadingOption = { title: '正在加载...' }
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showLoading({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: async (rea) => {
        reject(rea);
      },
    });
  });
};

export const hideLoading = async (
  options: HideLoadingOption = {}
): Promise<GeneralCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.hideLoading({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: (rea) => {
        reject(rea);
      },
    });
  });
};

export const showModal = async (
  options: ShowModalOption = { title: 'ok', content: 'ok' }
): Promise<ShowModalSuccessCallbackResult> => {
  return await new Promise((resolve, reject) => {
    wx.showModal({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: async (rea) => {
        reject(rea);
      },
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
  if (total < 10) {
    return total + '';
  } else if (total >= 10 && total < 20) {
    return '10+';
  } else if (total >= 20 && total < 30) {
    return '20+';
  } else if (total >= 30 && total < 40) {
    return '30+';
  } else if (total >= 40 && total < 50) {
    return '40+';
  } else if (total >= 50 && total < 60) {
    return '50+';
  } else if (total >= 60 && total < 70) {
    return '60+';
  } else if (total >= 70 && total < 80) {
    return '70+';
  } else if (total >= 80 && total < 90) {
    return '80+';
  } else if (total >= 90 && total < 100) {
    return '99+';
  } else if (total >= 100 && total < 900) {
    return total + '+';
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
    try {
      const reason = JSON.parse(e.message);
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
    } catch (e) {
      error.message = 'Failed To Parse Wrong Instance => ' + e + '';
    }
  } else if (typeof e === 'string') {
    error.message = e;
  } else if (typeof e === 'object') {
    error = {
      ...error,
      ...e,
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
