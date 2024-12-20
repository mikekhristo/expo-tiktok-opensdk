package expo.modules.tiktokopensdk

import android.content.Context
import com.bytedance.sdk.open.tiktok.TikTokOpenSDK
import com.bytedance.sdk.open.tiktok.api.TikTokOpenApi
import com.bytedance.sdk.open.tiktok.share.Share
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class ExpoTikTokOpenSDKModule : Module() {
    private val context: Context
        get() = requireNotNull(appContext.reactContext)

    override fun definition() = ModuleDefinition {
        Name("ExpoTikTokOpenSDK")

        Function("share") { mediaUrls: List<String>, isImage: Boolean, isGreenScreen: Boolean, hashtags: List<String>, description: String ->
            return@Function try {
                val request = Share.Request()
                
                // Convert URLs to local files
                val mediaFiles = mediaUrls.map { File(it) }
                
                // Configure media type and files
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
                    request.setTitle(description)
                }
                
                // Configure green screen if needed
                if (isGreenScreen) {
                    request.setShareFormat(Share.SHARE_FORMAT_GREEN_SCREEN)
                }
                
                // Send share request
                val api = TikTokOpenApi.getInstance()
                val response = api.share(context, request)
                
                if (response.isSuccess()) {
                    mapOf(
                        "isSuccess" to true
                    )
                } else {
                    mapOf(
                        "isSuccess" to false,
                        "errorCode" to response.errorCode,
                        "subErrorCode" to response.subErrorCode,
                        "errorMsg" to (response.errorMsg ?: "Unknown error")
                    )
                }
            } catch (e: Exception) {
                mapOf(
                    "isSuccess" to false,
                    "errorCode" to -1,
                    "errorMsg" to (e.message ?: "Unknown error")
                )
            }
        }

        Function("auth") { permissions: List<String>?, state: String? ->
            return@Function try {
                val request = com.bytedance.sdk.open.tiktok.authorize.AuthRequest()
                permissions?.let { request.scope = it.joinToString(",") }
                state?.let { request.state = it }
                
                val api = TikTokOpenApi.getInstance()
                val response = api.authorize(context, request)
                
                if (response.isSuccess()) {
                    mapOf(
                        "isSuccess" to true,
                        "authCode" to (response.authCode ?: ""),
                        "state" to (response.state ?: ""),
                        "grantedPermissions" to (response.grantedPermissions ?: emptyList<String>())
                    )
                } else {
                    mapOf(
                        "isSuccess" to false,
                        "errorCode" to response.errorCode,
                        "errorMsg" to (response.errorMsg ?: "Unknown error")
                    )
                }
            } catch (e: Exception) {
                mapOf(
                    "isSuccess" to false,
                    "errorCode" to -1,
                    "errorMsg" to (e.message ?: "Unknown error")
                )
            }
        }

        OnCreate {
            // Initialize TikTok SDK when the module is created
            val appContext = requireNotNull(appContext.reactContext)
            TikTokOpenSDK.init(appContext)
        }
    }
}
