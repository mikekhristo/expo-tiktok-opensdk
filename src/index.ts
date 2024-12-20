import ExpoTikTokOpenSDK from './ExpoTikTokOpenSDK';
import './module';

export type ShareSuccessResult = {
  isSuccess: true;
};

export type ShareErrorResult = {
  isSuccess: false;
  errorCode?: number;
  errorMsg?: string;
};

export type ShareResult = ShareSuccessResult | ShareErrorResult;

export interface ShareOptions {
  mediaUrls: string[];
  isImage?: boolean;
  isGreenScreen?: boolean;
  hashtags?: string[];
  description?: string;
}

export interface AuthResult {
  isSuccess: boolean;
  errorCode?: number;
  errorMsg?: string;
  authCode?: string;
  state?: string;
  grantedPermissions?: string[];
}

class TikTokOpenSDK {
  /**
   * Share media content to TikTok
   * @param options Share options including media URLs and additional parameters
   * @returns Promise resolving to share result
   */
  static async share(options: ShareOptions): Promise<ShareResult> {
    return await ExpoTikTokOpenSDK.share(
      options.mediaUrls,
      options.isImage ?? false,
      options.isGreenScreen ?? false,
      options.hashtags ?? [],
      options.description ?? ''
    );
  }

  /**
   * Check if TikTok app is installed
   * @returns Promise<boolean>
   */
  static async isAppInstalled(): Promise<boolean> {
    return await ExpoTikTokOpenSDK.isAppInstalled();
  }

  /**
   * Authenticate with TikTok
   * @param permissions Array of permission scopes to request
   * @returns Promise resolving to authentication result
   */
  static async auth(permissions: string[] = ['user.info.basic']): Promise<AuthResult> {
    return await ExpoTikTokOpenSDK.auth(permissions);
  }
}

export default TikTokOpenSDK;
