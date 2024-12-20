"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } = config_plugins_1.AndroidConfig.Manifest;
const pkg = require('../../package.json');
const withTikTokOpenSDKAndroid = (config, props) => {
    return (0, config_plugins_1.withAndroidManifest)(config, async (config) => {
        const mainApplication = getMainApplicationOrThrow(config.modResults);
        // Add TikTok SDK activities
        if (!Array.isArray(mainApplication.activity)) {
            mainApplication.activity = [];
        }
        const hasShareActivity = mainApplication.activity.some(activity => { var _a; return ((_a = activity.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'com.tiktok.open.sdk.share.ShareActivity'; });
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
        const appKeyMetadata = mainApplication['meta-data'].find(item => { var _a; return ((_a = item.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'com.bytedance.sdk.appKey'; });
        if (!appKeyMetadata) {
            addMetaDataItemToMainApplication(mainApplication, 'com.bytedance.sdk.appKey', props.androidClientKey);
        }
        if (props.scheme) {
            const schemeMetadata = mainApplication['meta-data'].find(item => { var _a; return ((_a = item.$) === null || _a === void 0 ? void 0 : _a['android:name']) === 'com.bytedance.sdk.scheme'; });
            if (!schemeMetadata) {
                addMetaDataItemToMainApplication(mainApplication, 'com.bytedance.sdk.scheme', props.scheme);
            }
        }
        return config;
    });
};
const withTikTokOpenSDKIOS = (config, props) => {
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        // Add URL schemes
        if (!Array.isArray(config.modResults.CFBundleURLTypes)) {
            config.modResults.CFBundleURLTypes = [];
        }
        const urlSchemes = [`tiktok${props.iosClientKey}`];
        if (props.scheme)
            urlSchemes.push(props.scheme);
        if (props.redirectScheme)
            urlSchemes.push(props.redirectScheme);
        // Check if URL type already exists
        const existingUrlType = config.modResults.CFBundleURLTypes.find(urlType => { var _a; return (_a = urlType.CFBundleURLSchemes) === null || _a === void 0 ? void 0 : _a.includes(`tiktok${props.iosClientKey}`); });
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
const withTikTokOpenSDK = (config, props) => {
    if (!props.iosClientKey && !props.androidClientKey) {
        throw new Error('Missing required TikTok SDK configuration. Please provide at least one of: iosClientKey or androidClientKey');
    }
    return (0, config_plugins_1.withPlugins)(config, [
        [withTikTokOpenSDKAndroid, props],
        [withTikTokOpenSDKIOS, props]
    ]);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withTikTokOpenSDK, pkg.name, pkg.version);
//# sourceMappingURL=withTikTokOpenSDK.js.map