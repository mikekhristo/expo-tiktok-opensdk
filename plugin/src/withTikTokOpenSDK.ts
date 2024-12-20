import { ConfigPlugin, withPlugins, withInfoPlist, withAndroidManifest, AndroidConfig } from '@expo/config-plugins';

const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = AndroidConfig.Manifest;

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
    mainApplication.activity = mainApplication.activity || [];
    mainApplication.activity.push({
      $: {
        'android:name': 'com.tiktok.open.sdk.share.ShareActivity',
        'android:exported': 'true',
        'android:launchMode': 'singleTask'
      }
    });

    // Add TikTok SDK metadata
    addMetaDataItemToMainApplication(
      config.modResults,
      'com.bytedance.sdk.appKey',
      props.androidClientKey
    );

    if (props.scheme) {
      addMetaDataItemToMainApplication(
        config.modResults,
        'com.bytedance.sdk.scheme',
        props.scheme
      );
    }

    return config;
  });
};

const withTikTokOpenSDKIOS: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  return withInfoPlist(config, (config) => {
    // Add URL schemes
    config.modResults.CFBundleURLTypes = config.modResults.CFBundleURLTypes || [];
    config.modResults.CFBundleURLTypes.push({
      CFBundleURLSchemes: [
        `tiktok${props.iosClientKey}`,
        props.scheme,
        props.redirectScheme
      ].filter(Boolean)
    });

    // Add LSApplicationQueriesSchemes
    config.modResults.LSApplicationQueriesSchemes = [
      ...(config.modResults.LSApplicationQueriesSchemes || []),
      'tiktokopensdk',
      'tiktoksharesdk',
      'snssdk1128',
      'snssdk1233'
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

export = withTikTokOpenSDK;
