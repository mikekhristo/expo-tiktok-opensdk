# expo-tiktok-opensdk

TikTok OpenSDK module for Expo apps

## Installation

```bash
npx expo install expo-tiktok-opensdk
```

## Configuration

Add the plugin to your `app.json`/`app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-tiktok-opensdk",
        {
          "iosClientKey": "YOUR_IOS_CLIENT_KEY",
          "androidClientKey": "YOUR_ANDROID_CLIENT_KEY",
          "iosUniversalLink": "YOUR_UNIVERSAL_LINK", // Optional
          "scheme": "YOUR_APP_SCHEME", // Optional
          "redirectScheme": "YOUR_REDIRECT_SCHEME" // Optional
        }
      ]
    ]
  }
}
```

## Usage

### Share Content

```typescript
import TikTokOpenSDK from 'expo-tiktok-opensdk';

// Share a video
await TikTokOpenSDK.share({
  mediaUrls: ['path/to/video.mp4'],
  isImage: false,
  description: 'Check out this cool video!',
  hashtags: ['expo', 'react-native']
});

// Share images
await TikTokOpenSDK.share({
  mediaUrls: ['path/to/image1.jpg', 'path/to/image2.jpg'],
  isImage: true,
  description: 'Beautiful photos!',
  hashtags: ['photography', 'nature']
});

// Share with green screen effect
await TikTokOpenSDK.share({
  mediaUrls: ['path/to/video.mp4'],
  isImage: false,
  isGreenScreen: true,
  description: 'Green screen magic!'
});
```

### Authentication

```typescript
import TikTokOpenSDK from 'expo-tiktok-opensdk';

const result = await TikTokOpenSDK.auth();
if (result.isSuccess) {
  console.log('Auth code:', result.authCode);
  console.log('Granted permissions:', result.grantedPermissions);
} else {
  console.error('Auth failed:', result.errorMsg);
}
```

## API Reference

### Share Options

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| mediaUrls | string[] | Yes | Array of local file URLs to share |
| isImage | boolean | No | Whether the media is an image (default: false) |
| isGreenScreen | boolean | No | Whether to use green screen effect (default: false) |
| hashtags | string[] | No | Optional hashtags to include |
| description | string | No | Optional description for the shared content |

### Share Result

Success result:
```typescript
{
  isSuccess: true
}
```

Error result:
```typescript
{
  isSuccess: false,
  errorCode: number,
  subErrorCode?: number, // Android only
  shareState?: number, // iOS only
  errorMsg: string
}
```

### Auth Result

```typescript
{
  isSuccess: boolean,
  errorCode?: number,
  errorMsg?: string,
  authCode?: string,
  state?: string,
  grantedPermissions?: string[]
}
```

## Requirements

- Expo SDK 49 or newer
- iOS 13.0 or newer
- Android API level 21 or newer

## License

MIT
