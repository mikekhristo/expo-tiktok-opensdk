import { ConfigPlugin, createRunOncePlugin, withPlugins, withInfoPlist, withAndroidManifest, AndroidConfig } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;
const pkg = require('../../package.json');

interface TikTokOpenSDKPluginProps {
  iosClientKey: string;
  androidClientKey: string;
  iosUniversalLink?: string;
  scheme?: string;
  redirectScheme?: string;
}

const withTikTokOpenSDKAndroid: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = getMainApplicationOrThrow(config.modResults);

    // Add TikTok SDK activities
    if (!Array.isArray(mainApplication.activity)) {
      mainApplication.activity = [];
    }

    const hasShareActivity = mainApplication.activity.some(
      activity => activity.$?.['android:name'] === 'com.tiktok.open.sdk.share.ShareActivity'
    );

    if (!hasShareActivity) {
      mainApplication.activity.push({
        $: {
          'android:name': 'com.tiktok.open.sdk.share.ShareActivity',
          'android:exported': 'true',
          'android:launchMode': 'singleTask'
        }
      });
    }

    // Add TikTok SDK metadata
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    const appKeyMetadata = mainApplication['meta-data'].find(
      item => item.$?.['android:name'] === 'com.bytedance.sdk.appKey'
    );

    if (!appKeyMetadata) {
      addMetaDataItemToMainApplication(
        mainApplication,
        'com.bytedance.sdk.appKey',
        props.androidClientKey
      );
    }

    if (props.scheme) {
      const schemeMetadata = mainApplication['meta-data'].find(
        item => item.$?.['android:name'] === 'com.bytedance.sdk.scheme'
      );

      if (!schemeMetadata) {
        addMetaDataItemToMainApplication(
          mainApplication,
          'com.bytedance.sdk.scheme',
          props.scheme
        );
      }
    }

    return config;
  });
};

const withTikTokOpenSDKIOS: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  return withInfoPlist(config, (config) => {
    // Add URL schemes
    if (!Array.isArray(config.modResults.CFBundleURLTypes)) {
      config.modResults.CFBundleURLTypes = [];
    }

    const urlSchemes: string[] = [`tiktok${props.iosClientKey}`];
    if (props.scheme) urlSchemes.push(props.scheme);
    if (props.redirectScheme) urlSchemes.push(props.redirectScheme);

    // Check if URL type already exists
    const existingUrlType = config.modResults.CFBundleURLTypes.find(
      urlType => urlType.CFBundleURLSchemes?.includes(`tiktok${props.iosClientKey}`)
    );

    if (!existingUrlType) {
      config.modResults.CFBundleURLTypes.push({
        CFBundleURLSchemes: urlSchemes
      });
    }

    // Add LSApplicationQueriesSchemes
    const querySchemes = [
      'tiktokopensdk',
      'tiktoksharesdk',
      'snssdk1128',
      'snssdk1233'
    ];

    if (!Array.isArray(config.modResults.LSApplicationQueriesSchemes)) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }

    // Add only unique schemes
    config.modResults.LSApplicationQueriesSchemes = [
      ...new Set([
        ...config.modResults.LSApplicationQueriesSchemes,
        ...querySchemes
      ])
    ];

    // Add Universal Links if provided
    if (props.iosUniversalLink) {
      const domains = props.iosUniversalLink.replace(/https?:\/\//, '').split('/')[0];
      config.modResults.com_apple_developer_associated_domains = [
        `applinks:${domains}`
      ];
    }

    return config;
  });
};

const withTikTokOpenSDK: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  if (!props.iosClientKey && !props.androidClientKey) {
    throw new Error(
      'Missing required TikTok SDK configuration. Please provide at least one of: iosClientKey or androidClientKey'
    );
  }

  return withPlugins(config, [
    [withTikTokOpenSDKAndroid, props],
    [withTikTokOpenSDKIOS, props]
  ]);
};

export default createRunOncePlugin(withTikTokOpenSDK, pkg.name, pkg.version);
