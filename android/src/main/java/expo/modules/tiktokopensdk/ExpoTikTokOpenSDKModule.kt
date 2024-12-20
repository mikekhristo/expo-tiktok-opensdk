package expo.modules.tiktokopensdk

import android.content.Context
import com.bytedance.sdk.open.tiktok.TikTokOpenSDK
import com.bytedance.sdk.open.tiktok.api.TikTokOpenApi
import com.bytedance.sdk.open.tiktok.share.Share
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.modules.ModuleRegistryConsumer
import expo.modules.kotlin.modules.ReactModuleInfo
import expo.modules.kotlin.modules.ReactModuleInfoProvider
import java.io.File

class ExpoTikTokOpenSDKModule : Module(), ModuleRegistryConsumer, ReactModuleInfoProvider {
    private val context: Context
        get() = requireNotNull(appContext.reactContext)

    override fun definition() = ModuleDefinition {
        Name("ExpoTikTokOpenSDK")

        OnCreate {
            // Initialize TikTok SDK when module is created
            try {
                val applicationContext = context.applicationContext
                TikTokOpenSDK.init(applicationContext)
            } catch (e: Exception) {
                // Log initialization error but don't throw
                println("Failed to initialize TikTok SDK: ${e.message}")
            }
        }

        Function("share") { mediaUrls: List<String>, isImage: Boolean, isGreenScreen: Boolean, hashtags: List<String>, description: String ->
            return@Function try {
                val request = Share.Request()
                
                // Set media files
                val mediaFiles = mediaUrls.map { File(it) }
                if (isImage) {
                    request.setImageList(mediaFiles)
                } else {
                    request.setVideoList(mediaFiles)
                }
                
                // Set hashtags and description
                if (hashtags.isNotEmpty()) {
                    request.setHashtagList(hashtags)
                }
                if (description.isNotEmpty()) {
                    request.title = description
                }
                
                // Set green screen mode if needed
                if (isGreenScreen) {
                    request.shareFormat = Share.SHARE_FORMAT_GREEN_SCREEN
                }
                
                // Send share request
                val api: TikTokOpenApi = TikTokOpenSDK.getApi()
                val response = api.share(request)
                
                mapOf(
                    "isSuccess" to response.isSuccess,
                    "errorCode" to response.errorCode,
                    "errorMsg" to (response.errorMsg ?: "")
                )
            } catch (e: Exception) {
                mapOf(
                    "isSuccess" to false,
                    "errorCode" to -1,
                    "errorMsg" to (e.message ?: "Unknown error")
                )
            }
        }

        Function("isAppInstalled") {
            return@Function try {
                TikTokOpenSDK.isAppInstalled()
            } catch (e: Exception) {
                false
            }
        }

        Function("auth") { permissions: List<String> ->
            return@Function try {
                val api: TikTokOpenApi = TikTokOpenSDK.getApi()
                val response = api.authorize(permissions)
                
                mapOf(
                    "isSuccess" to response.isSuccess,
                    "errorCode" to response.errorCode,
                    "errorMsg" to (response.errorMsg ?: ""),
                    "authCode" to (response.authCode ?: ""),
                    "state" to (response.state ?: ""),
                    "grantedPermissions" to (response.grantedPermissions ?: emptyList<String>())
                )
            } catch (e: Exception) {
                mapOf(
                    "isSuccess" to false,
                    "errorCode" to -1,
                    "errorMsg" to (e.message ?: "Unknown error")
                )
            }
        }
    }

    override fun setModuleRegistry(moduleRegistry: Any) {
        // Register the module
        moduleRegistry as ModuleRegistry
        moduleRegistry.registerModule("ExpoTikTokOpenSDK", this)
    }

    override fun reactModuleInfo(): ReactModuleInfo {
        return ReactModuleInfo(
            "ExpoTikTokOpenSDK",
            "ExpoTikTokOpenSDK",
            "ExpoTikTokOpenSDK",
            false,
            false
        )
    }
}
