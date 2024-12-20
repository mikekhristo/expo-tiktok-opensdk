import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

const TikTokOpenSDKModule = requireNativeModule('ExpoTikTokOpenSDK');

export type ShareSuccessResult = {
  isSuccess: true;
};

export type ShareErrorResult = {
  isSuccess: false;
  errorCode: number;
  subErrorCode?: number;
  shareState?: number;
  errorMsg: string;
};

export type ShareResult = ShareSuccessResult | ShareErrorResult;

export type ShareOptions = {
  /**
   * Array of local file URLs to share
   */
  mediaUrls: string[];
  /**
   * Whether the media is an image (default: false)
   */
  isImage?: boolean;
  /**
   * Whether to use green screen effect (default: false)
   */
  isGreenScreen?: boolean;
  /**
   * Optional hashtags to include with the share
   */
  hashtags?: string[];
  /**
   * Optional description for the shared content
   */
  description?: string;
};

export type AuthResult = {
  isSuccess: boolean;
  errorCode?: number;
  errorMsg?: string;
  authCode?: string;
  state?: string;
  grantedPermissions?: string[];
};

class TikTokOpenSDK {
  /**
   * Share media content to TikTok
   * @param options Share options including media URLs and additional parameters
   * @returns Promise resolving to share result
   */
  static async share(options: ShareOptions): Promise<ShareResult> {
    try {
      const { mediaUrls, isImage = false, isGreenScreen = false, hashtags = [], description = '' } = options;

      if (!mediaUrls.length) {
        throw new Error('At least one media URL must be provided');
      }

      if (Platform.OS === 'android') {
        const result = await TikTokOpenSDKModule.share(
          mediaUrls,
          isImage,
          isGreenScreen,
          hashtags,
          description
        );
        if (result.isSuccess) {
          return { isSuccess: true };
        } else {
          return {
            isSuccess: false,
            errorCode: result.errorCode,
            subErrorCode: result.subErrorCode,
            errorMsg: result.errorMsg,
          };
        }
      } else if (Platform.OS === 'ios') {
        const result = await TikTokOpenSDKModule.share(
          mediaUrls,
          isImage,
          isGreenScreen,
          hashtags,
          description
        );
        if (result.isSuccess) {
          return { isSuccess: true };
        } else {
          return {
            isSuccess: false,
            errorCode: result.errorCode,
            shareState: result.shareState,
            errorMsg: result.errorMsg,
          };
        }
      } else {
        throw new Error('Unsupported platform');
      }
    } catch (error) {
      console.error('Error sharing to TikTok:', error);
      throw error;
    }
  }

  /**
   * Check if TikTok app is installed
   * @returns Promise<boolean>
   */
  static async isAppInstalled(): Promise<boolean> {
    try {
      return await TikTokOpenSDKModule.isAppInstalled();
    } catch (error) {
      console.error('Error checking TikTok app installation:', error);
      return false;
    }
  }

  /**
   * Authenticate with TikTok
   * @param permissions Array of permission scopes to request
   * @returns Promise resolving to authentication result
   */
  static async auth(permissions: string[] = ['user.info.basic']): Promise<AuthResult> {
    try {
      return await TikTokOpenSDKModule.auth(permissions);
    } catch (error) {
      console.error('Error authenticating with TikTok:', error);
      throw error;
    }
  }
}

export default TikTokOpenSDK;
