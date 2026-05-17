package com.huzur.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

object HuzurWidgetUpdater {
  private const val PREFS_NAME = "huzur_widgets"
  private const val KEY_PRAYER_TIMES = "prayer_times_json"
  private const val KEY_LOCATION = "location_label"
  private const val KEY_SOURCE = "source_label"
  private const val KEY_AYAH_ARABIC = "ayah_arabic"
  private const val KEY_AYAH_TRANSLATION = "ayah_translation"
  private const val KEY_AYAH_SOURCE = "ayah_source"
  private const val KEY_AYAH_LIST = "ayah_list_json"
  private const val KEY_HIJRI_DATE = "hijri_date"

  private val defaultPrayerTimes = listOf(
    PrayerEntry("İmsak", "05:23"),
    PrayerEntry("Güneş", "06:50"),
    PrayerEntry("Öğle", "13:21"),
    PrayerEntry("İkindi", "16:58"),
    PrayerEntry("Akşam", "20:04"),
    PrayerEntry("Yatsı", "21:35")
  )

  private val defaultAyahs = listOf(
    AyahEntry("اِنَّ مَعَ الْعُسْرِ يُسْرًا", "Şüphesiz her zorlukla beraber bir kolaylık vardır.", "İnşirah Suresi, 6"),
    AyahEntry("فَاذْكُرُونِي أَذْكُرْكُمْ", "Siz beni anın ki ben de sizi anayım.", "Bakara Suresi, 152"),
    AyahEntry("اَلَا بِذِكْرِ اللّٰهِ تَطْمَئِنُّ الْقُلُوبُ", "Kalpler ancak Allah'ı anmakla huzur bulur.", "Ra'd Suresi, 28")
  )

  fun saveData(
    context: Context,
    prayerTimesJson: String,
    locationLabel: String,
    sourceLabel: String,
    ayahArabic: String,
    ayahTranslation: String,
    ayahSource: String,
    ayahListJson: String,
    hijriDate: String
  ) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_PRAYER_TIMES, prayerTimesJson)
      .putString(KEY_LOCATION, locationLabel)
      .putString(KEY_SOURCE, sourceLabel)
      .putString(KEY_AYAH_ARABIC, ayahArabic)
      .putString(KEY_AYAH_TRANSLATION, ayahTranslation)
      .putString(KEY_AYAH_SOURCE, ayahSource)
      .putString(KEY_AYAH_LIST, ayahListJson)
      .putString(KEY_HIJRI_DATE, hijriDate)
      .apply()

    updateAll(context)
  }

  fun updateAll(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    updatePrayerWidgets(context, manager)
    updateAyahWidgets(context, manager)
  }

  private fun updatePrayerWidgets(context: Context, manager: AppWidgetManager) {
    val ids = manager.getAppWidgetIds(ComponentName(context, PrayerTimesWidgetProvider::class.java))
    ids.forEach { widgetId ->
      manager.updateAppWidget(widgetId, buildPrayerViews(context))
    }
  }

  private fun updateAyahWidgets(context: Context, manager: AppWidgetManager) {
    val ids = manager.getAppWidgetIds(ComponentName(context, DailyAyahWidgetProvider::class.java))
    ids.forEach { widgetId ->
      manager.updateAppWidget(widgetId, buildAyahViews(context))
    }
  }

  fun buildPrayerViews(context: Context): RemoteViews {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val times = parsePrayerTimes(prefs.getString(KEY_PRAYER_TIMES, null))
    val location = prefs.getString(KEY_LOCATION, "Türkiye") ?: "Türkiye"
    val source = prefs.getString(KEY_SOURCE, "Diyanet vakitleri") ?: "Diyanet vakitleri"
    val state = getNextPrayerState(times)
    val date = SimpleDateFormat("d MMMM EEEE", Locale("tr", "TR")).format(Calendar.getInstance().time)
    val hijriDate = prefs.getString(KEY_HIJRI_DATE, "") ?: ""
    val views = RemoteViews(context.packageName, R.layout.widget_prayer_times)

    views.setTextViewText(R.id.widget_prayer_location, location)
    views.setTextViewText(R.id.widget_prayer_source, source)
    views.setTextViewText(R.id.widget_prayer_date, date)
    views.setTextViewText(R.id.widget_prayer_hijri_date, hijriDate)
    views.setTextViewText(R.id.widget_next_prayer_name, state.next.name)
    views.setTextViewText(R.id.widget_next_prayer_time, state.next.time)
    views.setTextViewText(R.id.widget_next_prayer_countdown, "${state.countdown} kaldı")

    val visible = times.take(6)
    val cardIds = intArrayOf(R.id.widget_time_card_1, R.id.widget_time_card_2, R.id.widget_time_card_3, R.id.widget_time_card_4, R.id.widget_time_card_5, R.id.widget_time_card_6)
    val nameIds = intArrayOf(R.id.widget_time_name_1, R.id.widget_time_name_2, R.id.widget_time_name_3, R.id.widget_time_name_4, R.id.widget_time_name_5, R.id.widget_time_name_6)
    val timeIds = intArrayOf(R.id.widget_time_value_1, R.id.widget_time_value_2, R.id.widget_time_value_3, R.id.widget_time_value_4, R.id.widget_time_value_5, R.id.widget_time_value_6)
    for (index in nameIds.indices) {
      val item = visible.getOrNull(index)
      val isCurrent = item != null && index == state.currentIndex
      views.setInt(cardIds[index], "setBackgroundResource", if (isCurrent) R.drawable.widget_active_prayer_panel else R.drawable.widget_soft_panel)
      views.setTextViewText(nameIds[index], item?.name ?: "--")
      views.setTextViewText(timeIds[index], item?.time ?: "--:--")
      views.setTextColor(nameIds[index], Color.parseColor(if (isCurrent) "#073D33" else "#EBD8A1"))
      views.setTextColor(timeIds[index], Color.parseColor(if (isCurrent) "#073D33" else "#FFFFFF"))
    }

    views.setOnClickPendingIntent(R.id.widget_prayer_root, buildLaunchIntent(context, "huzur://prayer-times"))
    return views
  }

  fun buildAyahViews(context: Context): RemoteViews {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val ayah = getHourlyAyah(parseAyahs(prefs.getString(KEY_AYAH_LIST, null)))
    val views = RemoteViews(context.packageName, R.layout.widget_daily_ayah)
    views.setTextViewText(R.id.widget_ayah_arabic, ayah?.arabic ?: prefs.getString(KEY_AYAH_ARABIC, defaultAyahs.first().arabic))
    views.setTextViewText(R.id.widget_ayah_translation, ayah?.translation ?: prefs.getString(KEY_AYAH_TRANSLATION, defaultAyahs.first().translation))
    views.setTextViewText(R.id.widget_ayah_source, ayah?.source ?: prefs.getString(KEY_AYAH_SOURCE, defaultAyahs.first().source))
    views.setOnClickPendingIntent(R.id.widget_ayah_root, buildLaunchIntent(context, "huzur://"))
    return views
  }

  private fun buildLaunchIntent(context: Context, url: String): PendingIntent {
    val intent = Intent(context, MainActivity::class.java).apply {
      action = Intent.ACTION_VIEW
      data = Uri.parse(url)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }
    return PendingIntent.getActivity(context, url.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  private fun parsePrayerTimes(raw: String?): List<PrayerEntry> {
    if (raw.isNullOrBlank()) return defaultPrayerTimes

    return runCatching {
      val array = JSONArray(raw)
      List(array.length()) { index ->
        val item = array.getJSONObject(index)
        PrayerEntry(
          name = item.optString("name", "--"),
          time = item.optString("time", "--:--")
        )
      }.filter { it.time.contains(":") }
    }.getOrElse { defaultPrayerTimes }
  }

  private fun parseAyahs(raw: String?): List<AyahEntry> {
    if (raw.isNullOrBlank()) return defaultAyahs

    return runCatching {
      val array = JSONArray(raw)
      List(array.length()) { index ->
        val item = array.getJSONObject(index)
        AyahEntry(
          arabic = item.optString("arabic", ""),
          translation = item.optString("translation", ""),
          source = item.optString("source", "")
        )
      }.filter { it.arabic.isNotBlank() && it.translation.isNotBlank() }
    }.getOrElse { defaultAyahs }
  }

  private fun getHourlyAyah(ayahs: List<AyahEntry>): AyahEntry? {
    if (ayahs.isEmpty()) return null
    val calendar = Calendar.getInstance()
    val day = calendar.get(Calendar.DAY_OF_YEAR)
    val hour = calendar.get(Calendar.HOUR_OF_DAY)
    return ayahs[(day * 24 + hour) % ayahs.size]
  }

  private fun getNextPrayerState(times: List<PrayerEntry>): PrayerState {
    val now = Calendar.getInstance()
    val nowMinutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
    val indexed = times.mapIndexed { index, prayer -> IndexedPrayer(index, prayer, parseMinutes(prayer.time)) }
    val next = indexed.firstOrNull { it.minutes > nowMinutes } ?: indexed.first()
    val current = indexed.findLast { it.minutes <= nowMinutes } ?: indexed.last()
    val remaining = if (next.minutes > nowMinutes) next.minutes - nowMinutes else 1440 - nowMinutes + next.minutes
    return PrayerState(next.prayer, next.index, current.index, formatCountdown(remaining))
  }

  private fun parseMinutes(time: String): Int {
    val parts = time.split(":")
    val hour = parts.getOrNull(0)?.toIntOrNull() ?: 0
    val minute = parts.getOrNull(1)?.toIntOrNull() ?: 0
    return hour * 60 + minute
  }

  private fun formatCountdown(totalMinutes: Int): String {
    val hours = totalMinutes / 60
    val minutes = totalMinutes % 60
    return if (hours == 0) "${minutes} dk" else "${hours} sa ${minutes} dk"
  }

  private data class PrayerEntry(val name: String, val time: String)
  private data class AyahEntry(val arabic: String, val translation: String, val source: String)
  private data class IndexedPrayer(val index: Int, val prayer: PrayerEntry, val minutes: Int)
  private data class PrayerState(val next: PrayerEntry, val nextIndex: Int, val currentIndex: Int, val countdown: String)
}
