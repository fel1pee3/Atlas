import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  googleAndroidClientId?: string;
  googleWebClientId?: string;
};

export function getExtra(): Extra {
  return (Constants.expoConfig?.extra ?? {}) as Extra;
}

export function getGoogleAndroidClientId(): string {
  return (getExtra().googleAndroidClientId ?? '').trim();
}

export function getGoogleWebClientId(): string {
  return (getExtra().googleWebClientId ?? '').trim();
}
