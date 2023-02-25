import UploadFileOption = WechatMiniprogram.UploadFileOption;
import config from '@/config';
import { getStorageSync } from '@tools/index';
import Constants from '@/constants';

const uploadRequest = async (
  options: UploadFileOption & { token?: string }
): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const url = config.APP_API_SERVER + options.url;
    let header = { ...options.header };
    if (options.token) {
      header = {
        ...options.header,
        Authorization: `Bearer ${options.token}`,
      };
    } else {
      const token: string = getStorageSync(Constants.TICKET)?.token;
      if (token) {
        header = {
          Authorization: `Bearer ${token}`,
          ...options.header,
        };
      }
    }

    wx.uploadFile({
      ...options,
      url,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (rea) => {
        reject(
          new Error(
            JSON.stringify({
              status: 500,
              message: rea.errMsg,
            })
          )
        );
      },
    });
  });
};

export default uploadRequest;
