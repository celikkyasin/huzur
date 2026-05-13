import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { PrayerTime } from "@/types";

const STORAGE_KEY = "huzur_prayer_notifications_enabled";
const REMINDER_CHANNEL_ID = "vakit-hatirlatmalari";
const ADHAN_CHANNEL_ID = "vakit-ezan-sesi";
const ADHAN_SOUND = "adhan.ogg";
const REMINDER_MINUTES = 15;
const PRAYERS_WITH_ADHAN = new Set(["imsak", "ogle", "ikindi", "aksam", "yatsi"]);

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

async function ensureNotificationChannel() {
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
  return (await AsyncStorage.getItem(STORAGE_KEY)) === "true";
}

export async function setPrayerNotificationsEnabled(enabled: boolean, prayerTimes: PrayerTime[]) {
  if (!enabled) {
    await cancelPrayerNotifications();
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    return { enabled: false, permissionGranted: true };
  }

  await ensureNotificationChannel();
  const permissionGranted = await requestNotificationPermission();

  if (!permissionGranted) {
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    return { enabled: false, permissionGranted: false };
  }

  await cancelPrayerNotifications();

  for (const prayer of prayerTimes.filter((item) => PRAYERS_WITH_ADHAN.has(item.id))) {
    const { hour, minute } = parseTime(prayer.time);
    const reminder = subtractMinutes(hour, minute, REMINDER_MINUTES);

    await Notifications.scheduleNotificationAsync({
      identifier: `huzur-prayer-reminder-${prayer.id}`,
      content: {
        title: "Vakit Yaklaşıyor",
        body: `${prayer.name} vaktine ${REMINDER_MINUTES} dakika kaldı.`,
        sound: "default"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        channelId: REMINDER_CHANNEL_ID
      }
    });

    await Notifications.scheduleNotificationAsync({
      identifier: `huzur-prayer-adhan-${prayer.id}`,
      content: {
        title: "Ezan Vakti",
        body: `${prayer.name} vakti girdi.`,
        sound: ADHAN_SOUND
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ADHAN_CHANNEL_ID
      }
    });
  }

  await AsyncStorage.setItem(STORAGE_KEY, "true");
  return { enabled: true, permissionGranted: true };
}
