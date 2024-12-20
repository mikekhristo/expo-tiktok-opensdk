"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
        return config;
    });
};
const withTikTokOpenSDKIOS = (config, props) => {
    return (0, config_plugins_1.withInfoPlist)(config, config => {
        const infoPlist = config.modResults;
        // Add URL schemes
        if (!Array.isArray(infoPlist.CFBundleURLTypes)) {
            infoPlist.CFBundleURLTypes = [];
        }
        const urlSchemes = new Set();
        if (props.scheme) {
            urlSchemes.add(props.scheme);
        }
        if (props.redirectScheme) {
            urlSchemes.add(props.redirectScheme);
        }
        const hasExistingURLTypes = infoPlist.CFBundleURLTypes.some((urlType) => { var _a; return (_a = urlType.CFBundleURLSchemes) === null || _a === void 0 ? void 0 : _a.some((scheme) => urlSchemes.has(scheme)); });
        if (!hasExistingURLTypes && urlSchemes.size > 0) {
            infoPlist.CFBundleURLTypes.push({
                CFBundleURLSchemes: Array.from(urlSchemes)
            });
        }
        // Add LSApplicationQueriesSchemes
        if (!Array.isArray(infoPlist.LSApplicationQueriesSchemes)) {
            infoPlist.LSApplicationQueriesSchemes = [];
        }
        const tiktokSchemes = ['tiktokopensdk', 'tiktoksharesdk', 'snssdk1180'];
        const newSchemes = tiktokSchemes.filter(scheme => { var _a; return !((_a = infoPlist.LSApplicationQueriesSchemes) === null || _a === void 0 ? void 0 : _a.includes(scheme)); });
        if (newSchemes.length > 0) {
            infoPlist.LSApplicationQueriesSchemes = [
                ...(infoPlist.LSApplicationQueriesSchemes || []),
                ...newSchemes
            ];
        }
        // Add TikTok client key
        infoPlist.TikTokClientKey = props.iosClientKey;
        // Add Universal Link if provided
        if (props.iosUniversalLink) {
            infoPlist.TikTokUniversalLink = props.iosUniversalLink;
        }
        return config;
    });
};
const withTikTokOpenSDK = (config, props) => {
    // Register the module in the app's native code
    config = (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const appDelegateFile = path.join(projectRoot, 'ios', config.modRequest.projectName || '', 'AppDelegate.mm');
            let contents = fs.readFileSync(appDelegateFile, 'utf-8');
            // Add import if not present
            if (!contents.includes('#import <ExpoTikTokOpenSDKModule/ExpoTikTokOpenSDKModule.h>')) {
                contents = contents.replace('#import "AppDelegate.h"', '#import "AppDelegate.h"\n#import <ExpoTikTokOpenSDKModule/ExpoTikTokOpenSDKModule.h>');
            }
            // Add module registration if not present
            if (!contents.includes('[ExpoTikTokOpenSDKModule register')) {
                contents = contents.replace('[super application:application didFinishLaunchingWithOptions:launchOptions];', '[ExpoTikTokOpenSDKModule register];\n  [super application:application didFinishLaunchingWithOptions:launchOptions];');
            }
            fs.writeFileSync(appDelegateFile, contents);
            return config;
        }
    ]);
    return (0, config_plugins_1.withPlugins)(config, [
        [withTikTokOpenSDKAndroid, props],
        [withTikTokOpenSDKIOS, props]
    ]);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withTikTokOpenSDK, pkg.name, pkg.version);
//# sourceMappingURL=withTikTokOpenSDK.js.map