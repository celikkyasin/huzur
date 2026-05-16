package com.huzur.app

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context

class DailyAyahWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    appWidgetIds.forEach { widgetId ->
      appWidgetManager.updateAppWidget(widgetId, HuzurWidgetUpdater.buildAyahViews(context))
    }
  }
}
