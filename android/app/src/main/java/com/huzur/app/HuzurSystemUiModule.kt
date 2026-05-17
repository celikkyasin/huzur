package com.huzur.app

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.Window
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HuzurSystemUiModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "HuzurSystemUi"
  private val handler = Handler(Looper.getMainLooper())

  @ReactMethod
  fun setVideoFullscreen(enabled: Boolean) {
    reactApplicationContext.currentActivity?.runOnUiThread {
      val window = reactApplicationContext.currentActivity?.window ?: return@runOnUiThread
      val decorView = window.decorView

      decorView.setOnSystemUiVisibilityChangeListener(null)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        WindowCompat.setDecorFitsSystemWindows(window, !enabled)
        val controller = WindowInsetsControllerCompat(window, decorView)
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        if (enabled) {
          applyImmersive(window)
          decorView.setOnSystemUiVisibilityChangeListener {
            applyImmersive(window)
          }
          handler.postDelayed({ applyImmersive(window) }, 350)
          handler.postDelayed({ applyImmersive(window) }, 1000)
        } else {
          controller.show(WindowInsetsCompat.Type.systemBars())
          decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        }
        return@runOnUiThread
      }

      decorView.systemUiVisibility = if (enabled) {
        immersiveFlags()
      } else {
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      }
    }
  }

  private fun applyImmersive(window: Window) {
    val decorView = window.decorView
    decorView.systemUiVisibility = immersiveFlags()

    val controller = WindowInsetsControllerCompat(window, decorView)
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    controller.hide(WindowInsetsCompat.Type.systemBars())
  }

  private fun immersiveFlags(): Int {
    return View.SYSTEM_UI_FLAG_FULLSCREEN or
      View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
      View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
      View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE
  }
}
