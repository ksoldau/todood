import { Platform } from 'react-native';

// keys are type OS
const baseUrls = {
  web: 'http://localhost:3000',
  ios: 'http://localhost:3000',
};

function getBaseUrl() {
  const baseUrl = baseUrls[Platform.OS];
  if (!baseUrl) {
    throw new Error(`Need a base url for the platform: ${Platform.OS}`);
  }
  return baseUrl;
}

export const API_BASE_URL = getBaseUrl();
