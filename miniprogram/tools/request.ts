import axios, {
  type AxiosPromise,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const requestAdapter = async (
  config: InternalAxiosRequestConfig
): AxiosPromise => {
  return await new Promise((resolve, reject) => {
    const url = config.url;
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

    const data =
      config.method === 'GET' || config.method === 'DELETE'
        ? config.params
        : config.data;
    const header = { ...config.headers };

    const request = wx.request({
      url,
      data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response: AxiosResponse<unknown, unknown> = {
            data: res.data,
            status: res.statusCode,
            statusText: res.errMsg,
            headers: res.header,
            config,
            request,
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

// @ts-expect-error FormData Operations Not Supported
axios.defaults.env.FormData = () => {
  throw new Error('FormData Operations Not Supported');
};
// @ts-expect-error Blob Operations Not Supported
axios.defaults.env.Blob = () => {
  throw new Error('Blob Operations Not Supported');
};

axios.defaults.transformResponse = (data) => {
  return typeof data === 'object' && 'data' in data ? data.data : data;
};

axios.interceptors.response.use(
  (response) => {
    if (typeof response === 'object' && 'data' in response) {
      console.info('Request Output => ', response.data);
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

axios.defaults.adapter = requestAdapter;

export default axios;
