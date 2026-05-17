package com.huzur.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HuzurWidgetModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "HuzurWidgetModule"

  @ReactMethod
  fun updateWidgets(
    prayerTimesJson: String,
    locationLabel: String,
    sourceLabel: String,
    ayahArabic: String,
    ayahTranslation: String,
    ayahSource: String,
    ayahListJson: String
  ) {
    HuzurWidgetUpdater.saveData(
      reactContext,
      prayerTimesJson,
      locationLabel,
      sourceLabel,
      ayahArabic,
      ayahTranslation,
      ayahSource,
      ayahListJson
    )
  }
}
