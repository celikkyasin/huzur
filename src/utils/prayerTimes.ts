import type { PrayerTime } from "@/types";

const turkishDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const hijriMonths = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];

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

export function getHijriDisplayDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat("tr-TR-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
      .format(date)
      .replace(/\sAH$/i, "");
  } catch {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const adjustedMonth = month < 3 ? month + 12 : month;
    const adjustedYear = month < 3 ? year - 1 : year;
    const century = Math.floor(adjustedYear / 100);
    const yearOfCentury = adjustedYear - century * 100;
    const julianDay =
      Math.floor((146097 * century) / 4) +
      Math.floor((1461 * yearOfCentury) / 4) +
      Math.floor((153 * (adjustedMonth + 1)) / 5) +
      day +
      1721119;
    const islamicDays = julianDay - 1948440 + 10632;
    const cycle = Math.floor((islamicDays - 1) / 10631);
    const dayInCycle = islamicDays - 10631 * cycle + 354;
    const islamicYearInCycle = Math.floor((10985 - dayInCycle) / 5316) * Math.floor((50 * dayInCycle) / 17719) + Math.floor(dayInCycle / 5670) * Math.floor((43 * dayInCycle) / 15238);
    const islamicYear = islamicYearInCycle + 30 * cycle;
    const firstDayOfYear = 354 * islamicYear + Math.floor((3 + 11 * islamicYear) / 30) + 1948440 - 385;
    const islamicMonth = Math.min(12, Math.ceil((julianDay - 29 - firstDayOfYear) / 29.5) + 1);
    const firstDayOfMonth = 354 * islamicYear + Math.floor((3 + 11 * islamicYear) / 30) + Math.floor(29.5 * (islamicMonth - 1)) + 1948440 - 385;
    const islamicDay = julianDay - firstDayOfMonth + 1;

    return `${islamicDay} ${hijriMonths[islamicMonth - 1]} ${islamicYear}`;
  }
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
    hijriDate: getHijriDisplayDate(date),
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
