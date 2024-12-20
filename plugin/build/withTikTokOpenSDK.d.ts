declare const ConfigPlugin: any, withPlugins: any, withInfoPlist: any, withAndroidManifest: any, AndroidConfig: any;
declare const ExpoConfig: any;
declare const addMetaDataItemToMainApplication: any, getMainApplicationOrThrow: any;
type TikTokOpenSDKPluginProps = {
    iosClientKey: string;
    androidClientKey: string;
    iosUniversalLink?: string;
    scheme?: string;
    redirectScheme?: string;
};
declare const withTikTokOpenSDKAndroid: ConfigPlugin<TikTokOpenSDKPluginProps>;
declare const withTikTokOpenSDKIOS: ConfigPlugin<TikTokOpenSDKPluginProps>;
declare const withTikTokOpenSDK: ConfigPlugin<TikTokOpenSDKPluginProps>;
//# sourceMappingURL=withTikTokOpenSDK.d.ts.map