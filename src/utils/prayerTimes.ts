import type { PrayerTime } from "@/types";

const turkishDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

function getMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function getNowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function formatCountdown(totalMinutes: number) {
  const normalized = Math.max(0, totalMinutes);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  if (hours === 0) {
    return `${minutes} dk`;
  }

  return `${hours} sa ${minutes} dk`;
}

export function getDisplayDate(date = new Date()) {
  return turkishDateFormatter.format(date);
}

export function getDynamicPrayerState(prayerTimes: PrayerTime[], date = new Date()) {
  const now = getNowMinutes(date);
  const indexed = prayerTimes.map((prayer, index) => ({
    ...prayer,
    index,
    minuteOfDay: getMinutes(prayer.time)
  }));

  const next = indexed.find((prayer) => prayer.minuteOfDay > now) ?? indexed[0];
  const previous = indexed.findLast((prayer) => prayer.minuteOfDay <= now) ?? indexed[indexed.length - 1];
  const isTomorrow = next.minuteOfDay <= now;
  const minutesUntilNext = isTomorrow ? 1440 - now + next.minuteOfDay : next.minuteOfDay - now;

  const markedTimes = prayerTimes.map((prayer) => ({
    ...prayer,
    isNext: prayer.id === next.id,
    isPast: prayer.id !== next.id && getMinutes(prayer.time) <= now
  }));

  return {
    next,
    previous,
    minutesUntilNext,
    countdown: formatCountdown(minutesUntilNext),
    displayDate: getDisplayDate(date),
    markedTimes
  };
}

export function getPrayerWindow(prayerTimes: PrayerTime[], date = new Date()) {
  const state = getDynamicPrayerState(prayerTimes, date);
  const nextIndex = prayerTimes.findIndex((prayer) => prayer.id === state.next.id);
  const previousIndex = nextIndex === 0 ? prayerTimes.length - 1 : nextIndex - 1;
  const ordered = [
    prayerTimes[previousIndex],
    ...Array.from({ length: Math.min(4, prayerTimes.length) }, (_, index) => prayerTimes[(nextIndex + index) % prayerTimes.length])
  ];

  return ordered.map((prayer) => ({
    ...prayer,
    isNext: prayer.id === state.next.id,
    isPast: prayer.id === state.previous.id
  }));
}
