import { notification } from 'antd';
import codeMessage from './codeMessage';
import useLanguage from '@/locale/useLanguage';

const errorHandler = (error) => {
  const translate = useLanguage();
  if (!navigator.onLine) {
    notification.config({
      duration: 15,
      maxCount: 1,
    });
    // Code to execute when there is internet connection
    notification.error({
      message: translate('No internet connection'),
      description: translate('Cannot connect to the Internet, Check your internet network'),
    });
    return {
      success: false,
      result: null,
      message: translate('Cannot connect to the server, Check your internet network'),
    };
  }

  const { response } = error;

  if (!response) {
    notification.config({
      duration: 20,
      maxCount: 1,
    });
    // Code to execute when there is no internet connection
    // notification.error({
    //   message: 'Problem connecting to server',
    //   description: 'Cannot connect to the server, Try again later',
    // });
    return {
      success: false,
      result: null,
      message: translate('Cannot connect to the server, Contact your Account administrator'),
    };
  }

  if (response && response.data && response.data.jwtExpired) {
    const result = window.localStorage.getItem('auth');
    const jsonFile = window.localStorage.getItem('isLogout');
    const { isLogout } = (jsonFile && JSON.parse(jsonFile)) || false;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('isLogout');
    if (result || isLogout) {
      window.location.href = '/logout';
    }
  }

  if (response && response.status) {
    const message = response.data && response.data.message;

    const errorText = message || codeMessage[response.status];
    const { status, error } = response;
    notification.config({
      duration: 20,
      maxCount: 2,
    });
    notification.error({
      message: translate(`error_${status}`),
      description: message ? translate(errorText) : errorText,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('isLogout');
      window.location.href = '/logout';
    } else return response.data;
  } else {
    notification.config({
      duration: 15,
      maxCount: 1,
    });

    if (navigator.onLine) {
      // Code to execute when there is internet connection
      notification.error({
        message: translate('Problem connecting to server'),
        description: translate('Cannot connect to the server, Try again later'),
      });
      return {
        success: false,
        result: null,
        message: translate('Cannot connect to the server, Contact your Account administrator'),
      };
    } else {
      // Code to execute when there is no internet connection
      notification.error({
        message: translate('No internet connection'),
        description: translate('Cannot connect to the Internet, Check your internet network'),
      });
      return {
        success: false,
        result: null,
        message: translate('Cannot connect to the server, Check your internet network'),
      };
    }
  }
};

export default errorHandler;
