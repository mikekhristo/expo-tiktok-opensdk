import { NativeModulesProxy } from 'expo-modules-core';

const ExpoTikTokOpenSDK = NativeModulesProxy.ExpoTikTokOpenSDK;

export default {
  name: 'ExpoTikTokOpenSDK',
  moduleName: 'ExpoTikTokOpenSDK',
  description: 'Expo module for TikTok OpenSDK',
  
  // Define the module's functions
  share: ExpoTikTokOpenSDK.share,
  isAppInstalled: ExpoTikTokOpenSDK.isAppInstalled,
  auth: ExpoTikTokOpenSDK.auth,
  
  async getTypesAsync() {
    return {
      ShareResult: {
        type: 'object',
        properties: {
          isSuccess: { type: 'boolean' },
          errorCode: { type: 'number', optional: true },
          errorMsg: { type: 'string', optional: true },
          shareState: { type: 'number', optional: true }
        }
      },
      ShareOptions: {
        type: 'object',
        properties: {
          mediaUrls: { type: 'array', items: { type: 'string' } },
          isImage: { type: 'boolean', optional: true },
          isGreenScreen: { type: 'boolean', optional: true },
          hashtags: { type: 'array', items: { type: 'string' }, optional: true },
          description: { type: 'string', optional: true }
        }
      },
      AuthResult: {
        type: 'object',
        properties: {
          isSuccess: { type: 'boolean' },
          errorCode: { type: 'number', optional: true },
          errorMsg: { type: 'string', optional: true },
          authCode: { type: 'string', optional: true },
          state: { type: 'string', optional: true },
          grantedPermissions: { type: 'array', items: { type: 'string' }, optional: true }
        }
      }
    };
  },
  async getConstants() {
    return {
      DEFAULT_PERMISSIONS: ['user.info.basic']
    };
  },
};
