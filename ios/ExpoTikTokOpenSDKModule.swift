import ExpoModulesCore
import TikTokOpenSDK

public class ExpoTikTokOpenSDKModule: Module {
    // Register the module with Expo
    public static func register(in context: ModuleRegistryContext) {
        let module = ExpoTikTokOpenSDKModule()
        context.register(module)
    }
    
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
                
                // Add hashtags and description
                if !hashtags.isEmpty {
                    request.hashtag = hashtags.joined(separator: " ")
                }
                request.landedPageType = isGreenScreen ? .greenScreen : .edit
                request.state = "state"
                
                // Send request
                request.send { response in
                    if let error = response.error {
                        promise.reject(
                            "SHARE_ERROR",
                            error.localizedDescription,
                            error
                        )
                    } else {
                        promise.resolve([
                            "isSuccess": response.isSucceed,
                            "errorCode": response.errorCode,
                            "shareState": response.shareState?.rawValue ?? 0,
                            "errorMsg": response.errorMsg ?? ""
                        ])
                    }
                }
            }
        }
        
        Function("isAppInstalled") { () -> Bool in
            return TikTokOpenSDKShareRequest.isAppInstalled()
        }
        
        Function("auth") { (permissions: [String]) -> [String: Any] in
            return try await withPromise { promise in
                let request = TikTokOpenSDKAuthRequest()
                request.permissions = permissions
                request.state = "state"
                
                request.send { response in
                    if let error = response.error {
                        promise.reject(
                            "AUTH_ERROR",
                            error.localizedDescription,
                            error
                        )
                    } else {
                        promise.resolve([
                            "isSuccess": response.isSucceed,
                            "errorCode": response.errorCode,
                            "errorMsg": response.errorMsg ?? "",
                            "authCode": response.code ?? "",
                            "state": response.state ?? "",
                            "grantedPermissions": response.grantedPermissions ?? []
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
