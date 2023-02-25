import axios, {
  type AxiosPromise,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import config from '@/config';
import { checkTicket, filterParams, getStorageSync } from '@tools/index';
import Constants from '@/constants';

const requestAdapter = async (
  config: InternalAxiosRequestConfig
): AxiosPromise => {
  return await new Promise((resolve, reject) => {
    let url = config.url;
    if (url === undefined) {
      reject(
        new Error(
          JSON.stringify({
            message: '请求地址不能为空',
            status: 400,
          })
        )
      );
      return;
    }
    url = (config.baseURL ?? '') + url;

    const data =
      config.method === 'get' || config.method === 'delete'
        ? filterParams(config.params)
        : config.data;
    const method = config.method?.toUpperCase() ?? 'GET';
    let header = { ...config.headers };
    const token = getStorageSync(Constants.TICKET)?.token;
    if (token) {
      header = {
        Authorization: 'Bearer ' + token,
        ...header,
      };
    }

    const request = wx.request({
      url,
      data,
      header,
      method: method as
        | 'OPTIONS'
        | 'GET'
        | 'HEAD'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'TRACE'
        | 'CONNECT',
      enableHttp2: true,
      success(res) {
        if (
          typeof res.data === 'object' &&
          'code' in res.data &&
          res.data.code
        ) {
          checkTicket(res.data.code);
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response: AxiosResponse<unknown, unknown> = {
            data: res.data,
            status: res.statusCode,
            statusText: res.errMsg,
            headers: res.header,
            config,
            request: {
              ...request,
              data,
            },
          };
          resolve(response);
        } else {
          reject(new Error(JSON.stringify(res)));
        }
      },
      fail(rea) {
        reject(
          new Error(
            JSON.stringify({
              message: rea.errMsg ?? '未知错误',
              status: rea.errno ?? 500,
              ...rea,
            })
          )
        );
      },
    });
  });
};

axios.defaults.transformResponse = (data) => {
  return typeof data === 'object' && 'data' in data ? data.data : data;
};

axios.interceptors.response.use(
  (response) => {
    const debug = config.DEBUG;
    const request = response.request;
    if (debug && typeof request === 'object' && 'data' in request) {
      console.debug('Request Output => ', request.data);
    }

    if (typeof response === 'object' && 'data' in response) {
      if (debug) {
        console.info('Response Output => ', response.data);
      }
      return response.data;
    } else {
      console.info('Skip Output => ~~~~~~');
      return response;
    }
  },
  async (reason) => {
    if (reason instanceof Error) {
      try {
        const parse = JSON.parse(reason.message);
        console.error('Error Output => ', parse);
      } catch (e) {
        console.error('Parse Error => ', e);
      }
    }
    return await Promise.reject(reason);
  }
);

axios.defaults.baseURL = config.APP_API_SERVER;
axios.defaults.adapter = requestAdapter;

export default axios;
