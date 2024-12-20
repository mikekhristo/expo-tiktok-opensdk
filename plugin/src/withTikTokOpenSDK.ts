import { ConfigPlugin, createRunOncePlugin, withPlugins, withInfoPlist, withAndroidManifest, AndroidConfig, withDangerousMod } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';
import * as fs from 'fs';
import * as path from 'path';

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

    return config;
  });
};

const withTikTokOpenSDKIOS: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  return withInfoPlist(config, config => {
    const infoPlist = config.modResults;

    // Add URL schemes
    if (!Array.isArray(infoPlist.CFBundleURLTypes)) {
      infoPlist.CFBundleURLTypes = [];
    }

    const urlSchemes = new Set<string>();
    if (props.scheme) {
      urlSchemes.add(props.scheme);
    }
    if (props.redirectScheme) {
      urlSchemes.add(props.redirectScheme);
    }

    const hasExistingURLTypes = infoPlist.CFBundleURLTypes.some(
      (urlType: any) => urlType.CFBundleURLSchemes?.some((scheme: string) => urlSchemes.has(scheme))
    );

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
    const newSchemes = tiktokSchemes.filter(
      scheme => !infoPlist.LSApplicationQueriesSchemes?.includes(scheme)
    );

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

const withTikTokOpenSDK: ConfigPlugin<TikTokOpenSDKPluginProps> = (config, props) => {
  // Register the module in the app's native code
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const appDelegateFile = path.join(projectRoot, 'ios', config.modRequest.projectName || '', 'AppDelegate.mm');
      
      let contents = fs.readFileSync(appDelegateFile, 'utf-8');
      
      // Add import if not present
      if (!contents.includes('#import <ExpoTikTokOpenSDKModule/ExpoTikTokOpenSDKModule.h>')) {
        contents = contents.replace(
          '#import "AppDelegate.h"',
          '#import "AppDelegate.h"\n#import <ExpoTikTokOpenSDKModule/ExpoTikTokOpenSDKModule.h>'
        );
      }
      
      // Add module registration if not present
      if (!contents.includes('[ExpoTikTokOpenSDKModule register')) {
        contents = contents.replace(
          '[super application:application didFinishLaunchingWithOptions:launchOptions];',
          '[ExpoTikTokOpenSDKModule register];\n  [super application:application didFinishLaunchingWithOptions:launchOptions];'
        );
      }
      
      fs.writeFileSync(appDelegateFile, contents);
      return config;
    }
  ]);

  return withPlugins(config, [
    [withTikTokOpenSDKAndroid, props],
    [withTikTokOpenSDKIOS, props]
  ]);
};

export default createRunOncePlugin(withTikTokOpenSDK, pkg.name, pkg.version);
