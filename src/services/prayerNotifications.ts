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

export type PrayerNotificationPreferences = {
  reminderMinutes: number;
  soundMode: PrayerNotificationSoundMode;
};

export const reminderMinuteOptions = [0, 5, 10, 15, 20, 30] as const;
export const soundModeOptions: Array<{ mode: PrayerNotificationSoundMode; label: string; description: string }> = [
  { mode: "silent", label: "Sessiz", description: "Sadece ekranda bildirim gösterir." },
  { mode: "default", label: "Telefon sesi", description: "Telefonun seçili bildirim sesiyle uyarır." },
  { mode: "adhan", label: "Ezan", description: "Vakit girince ezan sesi çalar." }
];

const defaultPreferences: PrayerNotificationPreferences = {
  reminderMinutes: 15,
  soundMode: "default"
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

function normalizePreferences(value?: Partial<PrayerNotificationPreferences> | null): PrayerNotificationPreferences {
  const reminderMinutes = Number(value?.reminderMinutes);
  const soundMode = value?.soundMode;

  return {
    reminderMinutes: reminderMinuteOptions.includes(reminderMinutes as (typeof reminderMinuteOptions)[number]) ? reminderMinutes : defaultPreferences.reminderMinutes,
    soundMode: soundMode === "silent" || soundMode === "default" || soundMode === "adhan" ? soundMode : defaultPreferences.soundMode
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

async function ensureNotificationChannels() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Vakit Hatırlatmaları",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 300, 180, 300],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });

  await Notifications.setNotificationChannelAsync(REMINDER_SILENT_CHANNEL_ID, {
    name: "Sessiz Vakit Hatırlatmaları",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: "Telefon Sesiyle Vakit Bildirimleri",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 300, 180, 300],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });

  await Notifications.setNotificationChannelAsync(SILENT_CHANNEL_ID, {
    name: "Sessiz Vakit Bildirimleri",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });

  await Notifications.setNotificationChannelAsync(ADHAN_CHANNEL_ID, {
    name: "Ezan Sesi",
    importance: Notifications.AndroidImportance.HIGH,
    sound: ADHAN_SOUND,
    vibrationPattern: [0, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });
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

export async function setPrayerNotificationPreferences(preferences: Partial<PrayerNotificationPreferences>, prayerTimes?: PrayerTime[]) {
  const nextPreferences = normalizePreferences({
    ...(await getPrayerNotificationPreferences()),
    ...preferences
  });
  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(nextPreferences));

  if (prayerTimes && (await getPrayerNotificationsEnabled())) {
    await setPrayerNotificationsEnabled(true, prayerTimes, nextPreferences);
  }

  return nextPreferences;
}

export async function setPrayerNotificationsEnabled(enabled: boolean, prayerTimes: PrayerTime[], preferences?: PrayerNotificationPreferences) {
  if (!enabled) {
    await cancelPrayerNotifications();
    await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "false");
    return { enabled: false, permissionGranted: true };
  }

  await ensureNotificationChannels();
  const permissionGranted = await requestNotificationPermission();

  if (!permissionGranted) {
    await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "false");
    return { enabled: false, permissionGranted: false };
  }

  await cancelPrayerNotifications();

  const notificationPreferences = preferences ?? (await getPrayerNotificationPreferences());
  const reminderMinutes = notificationPreferences.reminderMinutes;
  const exactSound = getSoundForMode(notificationPreferences.soundMode);
  const exactChannelId = getChannelForMode(notificationPreferences.soundMode);
  const reminderChannelId = notificationPreferences.soundMode === "silent" ? REMINDER_SILENT_CHANNEL_ID : REMINDER_CHANNEL_ID;

  for (const prayer of prayerTimes.filter((item) => PRAYERS_WITH_NOTIFICATIONS.has(item.id))) {
    const { hour, minute } = parseTime(prayer.time);

    if (reminderMinutes > 0) {
      const reminder = subtractMinutes(hour, minute, reminderMinutes);

      await Notifications.scheduleNotificationAsync({
        identifier: `huzur-prayer-reminder-${prayer.id}`,
        content: {
          title: "Vakit Yaklaşıyor",
          body: `${prayer.name} vaktine ${reminderMinutes} dakika kaldı.`,
          sound: notificationPreferences.soundMode === "silent" ? undefined : "default"
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: reminderChannelId
        }
      });
    }

    await Notifications.scheduleNotificationAsync({
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
    });
  }

  await AsyncStorage.setItem(ENABLED_STORAGE_KEY, "true");
  return { enabled: true, permissionGranted: true };
}
