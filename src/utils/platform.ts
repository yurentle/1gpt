import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

export const isIOS = Platform.OS === 'ios';

export const isAndroid = Platform.OS === 'android';

export const getWebTextStyles = () => {
  if (!isWeb) return {};

  return {
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    maxWidth: '100%',
  } as const;
};
