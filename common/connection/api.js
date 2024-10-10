import ENV from '../utils/env';
import axios from 'axios';

const api = (() => {
  const backendApi = axios.create({
    baseURL: ENV.EXPRESS_SERVER_BASE_URL,
  });

  const setupInterceptors = () => {
    // 요청 인터셉터
    backendApi.interceptors.request.use(
      (config) => {
        console.log('정상 요청');
        return config;
      },
      (error) => {
        console.log('비정상 요청');
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    backendApi.interceptors.response.use(
      (response) => {
        console.log('정상 응답');
        return response;
      },
      (error) => {
        console.log('응답 오류:', error.response.data);
        return Promise.reject(error);
      }
    );
  };

  setupInterceptors();

  return backendApi;
})();

export default api;
