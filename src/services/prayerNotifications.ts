import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { PrayerTime } from "@/types";

const ENABLED_STORAGE_KEY = "huzur_prayer_notifications_enabled";
const PREFERENCES_STORAGE_KEY = "huzur_prayer_notification_preferences";
const REMINDER_CHANNEL_ID = "vakit-hatirlatmalari-v2";
const REMINDER_SILENT_CHANNEL_ID = "vakit-hatirlatmalari-sessiz-v2";
const DEFAULT_CHANNEL_ID = "vakit-standart-bildirim-v2";
const SILENT_CHANNEL_ID = "vakit-sessiz-bildirim-v2";
const ADHAN_CHANNEL_ID = "vakit-ezan-sesi-v3";
const ADHAN_SOUND = "adhan.ogg";
const PRAYERS_WITH_NOTIFICATIONS = new Set(["imsak", "ogle", "ikindi", "aksam", "yatsi"]);

export type PrayerNotificationSoundMode = "silent" | "default" | "adhan";

export type PrayerNotifiableId = "imsak" | "ogle" | "ikindi" | "aksam" | "yatsi";

export type PerPrayerNotificationConfig = {
  enabled: boolean;
  reminderMinutes: number;
  soundMode: PrayerNotificationSoundMode;
};

export type PrayerNotificationPreferences = {
  reminderMinutes: number;
  soundMode: PrayerNotificationSoundMode;
  notifyOnTime?: boolean;
  perPrayer?: Partial<Record<PrayerNotifiableId, PerPrayerNotificationConfig>>;
};

export const NOTIFIABLE_PRAYERS: Array<{ id: PrayerNotifiableId; label: string; icon: "moon" | "sunny" | "partly-sunny" | "cloudy-night" | "sparkles" }> = [
  { id: "imsak", label: "İmsak / Sabah", icon: "sparkles" },
  { id: "ogle", label: "Öğle", icon: "sunny" },
  { id: "ikindi", label: "İkindi", icon: "partly-sunny" },
  { id: "aksam", label: "Akşam", icon: "cloudy-night" },
  { id: "yatsi", label: "Yatsı", icon: "moon" }
];

export const MIN_REMINDER_MINUTES = 0;
export const MAX_REMINDER_MINUTES = 45;
export const REMINDER_PRESETS = [0, 5, 10, 15, 30, 45];
export const soundModeOptions: Array<{ mode: PrayerNotificationSoundMode; label: string; description: string }> = [
  { mode: "silent", label: "Sessiz Bildirim", description: "Ses çalmadan yalnızca ekranda hatırlatma gösterir." },
  { mode: "default", label: "Kısa Uyarı Sesi", description: "Ezan okumadan telefonun zarif kısa bildirim tonunu çalar." },
  { mode: "adhan", label: "Ezan Sesi", description: "Vakit girdiğinde makamlı ezan sesi ile bildirim verir." }
];

function buildDefaultPerPrayer(reminderMinutes = 15, soundMode: PrayerNotificationSoundMode = "default"): Record<PrayerNotifiableId, PerPrayerNotificationConfig> {
  return {
    imsak: { enabled: true, reminderMinutes, soundMode },
    ogle: { enabled: true, reminderMinutes, soundMode },
    ikindi: { enabled: true, reminderMinutes, soundMode },
    aksam: { enabled: true, reminderMinutes, soundMode },
    yatsi: { enabled: true, reminderMinutes, soundMode }
  };
}

const defaultPreferences: PrayerNotificationPreferences = {
  reminderMinutes: 15,
  soundMode: "default",
  notifyOnTime: true,
  perPrayer: buildDefaultPerPrayer(15, "default")
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

function parseTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

function subtractMinutes(hour: number, minute: number, amount: number) {
  const total = (hour * 60 + minute - amount + 1440) % 1440;
  return {
    hour: Math.floor(total / 60),
    minute: total % 60
  };
}

function normalizeSoundMode(mode?: PrayerNotificationSoundMode): PrayerNotificationSoundMode {
  return mode === "silent" || mode === "default" || mode === "adhan" ? mode : defaultPreferences.soundMode;
}

function normalizeMinutes(minutes?: number, fallback = defaultPreferences.reminderMinutes): number {
  const num = Number(minutes);
  return Number.isFinite(num) ? Math.max(MIN_REMINDER_MINUTES, Math.min(MAX_REMINDER_MINUTES, Math.round(num))) : fallback;
}

function normalizePreferences(value?: Partial<PrayerNotificationPreferences> | null): PrayerNotificationPreferences {
  const normalizedReminderMinutes = normalizeMinutes(value?.reminderMinutes);
  const normalizedSoundMode = normalizeSoundMode(value?.soundMode);
  const notifyOnTime = value?.notifyOnTime !== false;
  const basePerPrayer = buildDefaultPerPrayer(normalizedReminderMinutes, normalizedSoundMode);
  const incomingPerPrayer = value?.perPrayer || {};

  const perPrayer: Record<PrayerNotifiableId, PerPrayerNotificationConfig> = {
    imsak: {
      enabled: incomingPerPrayer.imsak?.enabled ?? true,
      reminderMinutes: normalizeMinutes(incomingPerPrayer.imsak?.reminderMinutes, normalizedReminderMinutes),
      soundMode: normalizeSoundMode(incomingPerPrayer.imsak?.soundMode ?? normalizedSoundMode)
    },
    ogle: {
      enabled: incomingPerPrayer.ogle?.enabled ?? true,
      reminderMinutes: normalizeMinutes(incomingPerPrayer.ogle?.reminderMinutes, normalizedReminderMinutes),
      soundMode: normalizeSoundMode(incomingPerPrayer.ogle?.soundMode ?? normalizedSoundMode)
    },
    ikindi: {
      enabled: incomingPerPrayer.ikindi?.enabled ?? true,
      reminderMinutes: normalizeMinutes(incomingPerPrayer.ikindi?.reminderMinutes, normalizedReminderMinutes),
      soundMode: normalizeSoundMode(incomingPerPrayer.ikindi?.soundMode ?? normalizedSoundMode)
    },
    aksam: {
      enabled: incomingPerPrayer.aksam?.enabled ?? true,
      reminderMinutes: normalizeMinutes(incomingPerPrayer.aksam?.reminderMinutes, normalizedReminderMinutes),
      soundMode: normalizeSoundMode(incomingPerPrayer.aksam?.soundMode ?? normalizedSoundMode)
    },
    yatsi: {
      enabled: incomingPerPrayer.yatsi?.enabled ?? true,
      reminderMinutes: normalizeMinutes(incomingPerPrayer.yatsi?.reminderMinutes, normalizedReminderMinutes),
      soundMode: normalizeSoundMode(incomingPerPrayer.yatsi?.soundMode ?? normalizedSoundMode)
    }
  };

  return {
    reminderMinutes: normalizedReminderMinutes,
    soundMode: normalizedSoundMode,
    notifyOnTime,
    perPrayer: { ...basePerPrayer, ...perPrayer }
  };
}

function getSoundForMode(mode: PrayerNotificationSoundMode) {
  if (mode === "silent") {
    return undefined;
  }

  return mode === "adhan" ? ADHAN_SOUND : "default";
}

function getChannelForMode(mode: PrayerNotificationSoundMode) {
  if (mode === "silent") {
    return SILENT_CHANNEL_ID;
  }

  return mode === "adhan" ? ADHAN_CHANNEL_ID : DEFAULT_CHANNEL_ID;
}

let channelsReadyPromise: Promise<void> | null = null;
let scheduleDebounceTimer: ReturnType<typeof setTimeout> | null = null;

async function ensureNotificationChannels() {
  if (Platform.OS !== "android") {
    return;
  }

  if (channelsReadyPromise) {
    return channelsReadyPromise;
  }

  channelsReadyPromise = Promise.all([
    Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: "Vakit Hatırlatmaları",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 300, 180, 300],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    }),
    Notifications.setNotificationChannelAsync(REMINDER_SILENT_CHANNEL_ID, {
      name: "Sessiz Vakit Hatırlatmaları",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
      vibrationPattern: [],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    }),
    Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: "Kısa Vakit Bildirimleri",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 300, 180, 300],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    }),
    Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
      name: "Sessiz Vakit Bildirimleri",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: undefined,
      vibrationPattern: [],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    }),
    Notifications.setNotificationChannelAsync(ADHAN_CHANNEL_ID, {
      name: "Ezan Sesi",
      importance: Notifications.AndroidImportance.HIGH,
      sound: ADHAN_SOUND,
      vibrationPattern: [0, 400, 200, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    })
  ]).then(() => {});

  return channelsReadyPromise;
}

async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelPrayerNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => notification.identifier.startsWith("huzur-prayer-"))
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
  );
}

export async function getPrayerNotificationsEnabled() {
  return (await AsyncStorage.getItem(ENABLED_STORAGE_KEY)) === "true";
}

export async function getPrayerNotificationPreferences() {
  try {
    const value = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    return normalizePreferences(value ? JSON.parse(value) : null);
  } catch {
    return defaultPreferences;
  }
}

async function scheduleAllNotificationsNow(prayerTimes: PrayerTime[], notificationPreferences: PrayerNotificationPreferences) {
  await ensureNotificationChannels();
  await cancelPrayerNotifications();

  const tasks: Promise<unknown>[] = [];

  for (const prayer of prayerTimes.filter((item) => PRAYERS_WITH_NOTIFICATIONS.has(item.id))) {
    const prayerId = prayer.id as PrayerNotifiableId;
    const prayerConfig = notificationPreferences.perPrayer?.[prayerId] ?? {
      enabled: true,
      reminderMinutes: notificationPreferences.reminderMinutes,
      soundMode: notificationPreferences.soundMode
    };

    if (!prayerConfig.enabled) {
      continue;
    }

    const { hour, minute } = parseTime(prayer.time);
    const reminderMinutes = prayerConfig.reminderMinutes;
    const exactSound = getSoundForMode(prayerConfig.soundMode);
    const exactChannelId = getChannelForMode(prayerConfig.soundMode);
    const reminderChannelId = prayerConfig.soundMode === "silent" ? REMINDER_SILENT_CHANNEL_ID : REMINDER_CHANNEL_ID;

    if (reminderMinutes > 0) {
      const reminder = subtractMinutes(hour, minute, reminderMinutes);

      tasks.push(
        Notifications.scheduleNotificationAsync({
          identifier: `huzur-prayer-reminder-${prayer.id}`,
          content: {
            title: "Vakit Yaklaşıyor",
            body: `${prayer.name} vaktine ${reminderMinutes} dakika kaldı.`,
            sound: prayerConfig.soundMode === "silent" ? undefined : "default"
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: reminder.hour,
            minute: reminder.minute,
            channelId: reminderChannelId
          }
        })
      );
    }

    if (notificationPreferences.notifyOnTime !== false) {
      tasks.push(
        Notifications.scheduleNotificationAsync({
          identifier: `huzur-prayer-time-${prayer.id}`,
          content: {
            title: "Ezan Vakti",
            body: `${prayer.name} vakti girdi.`,
            sound: exactSound
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: exactChannelId
          }
        })
      );
    }
  }

  await Promise.all(tasks);
}

function debouncedReschedule(prayerTimes: PrayerTime[], nextPreferences: PrayerNotificationPreferences) {
  if (scheduleDebounceTimer) {
    clearTimeout(scheduleDebounceTimer);
  }

  scheduleDebounceTimer = setTimeout(() => {
    void getPrayerNotificationsEnabled().then((isEnabled) => {
      if (isEnabled) {
        void scheduleAllNotificationsNow(prayerTimes, nextPreferences).catch(() => {});
      }
    });
  }, 450);
}

export async function setPrayerNotificationPreferences(preferences: Partial<PrayerNotificationPreferences>, prayerTimes?: PrayerTime[]) {
  const current = await getPrayerNotificationPreferences();
  const nextPreferences = normalizePreferences({
    ...current,
    ...preferences,
    perPrayer: {
      ...(current.perPrayer || {}),
      ...(preferences.perPrayer || {})
    }
  });
  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(nextPreferences));

  if (prayerTimes) {
    debouncedReschedule(prayerTimes, nextPreferences);
  }

  return nextPreferences;
}

export async function setPrayerNotificationsEnabled(enabled: boolean, prayerTimes: PrayerTime[], preferences?: PrayerNotificationPreferences) {
  if (scheduleDebounceTimer) {
    clearTimeout(scheduleDebounceTimer);
    scheduleDebounceTimer = null;
  }

  if (!enabled) {
    await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "false");
    void cancelPrayerNotifications().catch(() => {});
    return { enabled: false, permissionGranted: true };
  }

  const permissionGranted = await requestNotificationPermission();

  if (!permissionGranted) {
    await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "false");
    return { enabled: false, permissionGranted: false };
  }

  await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "true");
  const notificationPreferences = normalizePreferences(preferences ?? (await getPrayerNotificationPreferences()));
  void scheduleAllNotificationsNow(prayerTimes, notificationPreferences).catch(() => {});

  return { enabled: true, permissionGranted: true };
}
