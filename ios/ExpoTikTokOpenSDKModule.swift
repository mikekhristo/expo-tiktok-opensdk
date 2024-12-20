import ExpoModulesCore
import TikTokOpenSDK

public class ExpoTikTokOpenSDKModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoTikTokOpenSDK")

        Function("share") { (mediaUrls: [String], isImage: Bool, isGreenScreen: Bool, hashtags: [String], description: String) -> [String: Any] in
            return try await withPromise { promise in
                // Convert URLs to local file URLs if needed
                let urls = mediaUrls.map { URL(fileURLWithPath: $0) }
                
                // Create share request
                let request = TikTokOpenSDKShareRequest()
                
                // Configure media type and URLs
                if isImage {
                    request.mediaType = .image
                    request.localIdentifiers = urls.map { $0.path }
                } else {
                    request.mediaType = .video
                    request.localIdentifiers = urls.map { $0.path }
                }
                
                // Set hashtags and description
                if !hashtags.isEmpty {
                    request.hashtags = hashtags
                }
                if !description.isEmpty {
                    request.landedPageTitle = description
                }
                
                // Configure green screen if needed
                if isGreenScreen {
                    request.shareFormat = .greenScreen
                }
                
                // Send share request
                request.send { response in
                    if response.isSucceed {
                        promise.resolve([
                            "isSuccess": true
                        ])
                    } else {
                        promise.resolve([
                            "isSuccess": false,
                            "errorCode": response.errorCode,
                            "shareState": response.shareState?.rawValue ?? 0,
                            "errorMsg": response.errorMsg ?? "Unknown error"
                        ])
                    }
                }
            }
        }

        Function("auth") { (permissions: [String]?, state: String?) -> [String: Any] in
            return try await withPromise { promise in
                let request = TikTokOpenSDKAuthRequest()
                if let perms = permissions {
                    request.permissions = perms
                }
                if let st = state {
                    request.state = st
                }
                
                request.send { response in
                    if response.isSucceed {
                        promise.resolve([
                            "isSuccess": true,
                            "authCode": response.code ?? "",
                            "state": response.state ?? "",
                            "grantedPermissions": response.grantedPermissions ?? []
                        ])
                    } else {
                        promise.resolve([
                            "isSuccess": false,
                            "errorCode": response.errorCode,
                            "errorMsg": response.errorMsg ?? "Unknown error"
                        ])
                    }
                }
            }
        }

        // Lifecycle events
        OnCreate {
            // Initialize TikTok SDK when the module is created
            if let clientKey = self.appContext?.config?["iosClientKey"] as? String {
                TikTokOpenSDKApplicationDelegate.sharedInstance().registerApp(universalLink: nil, clientKey: clientKey)
            }
        }
    }
}
