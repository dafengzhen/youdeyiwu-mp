import HideLoadingOption = WechatMiniprogram.HideLoadingOption;
import HideToastOption = WechatMiniprogram.HideToastOption;
import ShowLoadingOption = WechatMiniprogram.ShowLoadingOption;
import ShowToastOption = WechatMiniprogram.ShowToastOption;
import zhCN from 'date-fns/locale/zh-CN';
import { formatDistanceStrict } from 'date-fns';

export const showToast = async (
  options: ShowToastOption = { title: 'ok' }
): Promise<void> => {
  await new Promise((resolve, reject) => {
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
): Promise<void> => {
  await new Promise((resolve, reject) => {
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
): Promise<void> => {
  await new Promise((resolve, reject) => {
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
): Promise<void> => {
  await new Promise((resolve, reject) => {
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
  } else if (total > 10 && total < 20) {
    return '10+';
  } else if (total > 20 && total < 30) {
    return '20+';
  } else if (total > 30 && total < 40) {
    return '30+';
  } else if (total > 40 && total < 50) {
    return '40+';
  } else if (total > 50 && total < 60) {
    return '50+';
  } else if (total > 60 && total < 70) {
    return '60+';
  } else if (total > 70 && total < 80) {
    return '70+';
  } else if (total > 80 && total < 90) {
    return '80+';
  } else if (total > 90 && total < 100) {
    return '99+';
  } else if (total > 100 && total < 900) {
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
      error = {
        ...error,
        ...reason,
      };
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
