export type CurrentWeather = {
  label: string;
  icon: "sunny" | "partly-sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm";
};

const WEATHER_TIMEOUT_MS = 6000;

function describeWeather(code: number): Pick<CurrentWeather, "icon"> & { text: string } {
  if (code === 0) {
    return { text: "Açık", icon: "sunny" };
  }
  if ([1, 2, 3].includes(code)) {
    return { text: "Parçalı", icon: "partly-sunny" };
  }
  if ([45, 48].includes(code)) {
    return { text: "Sisli", icon: "cloudy" };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { text: "Yağışlı", icon: "rainy" };
  }
  if (code >= 71 && code <= 77) {
    return { text: "Karlı", icon: "snow" };
  }
  if (code >= 95) {
    return { text: "Fırtına", icon: "thunderstorm" };
  }

  return { text: "Hava", icon: "cloudy" };
}

export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
      };
    };

    const temperature = data.current?.temperature_2m;
    const weatherCode = data.current?.weather_code;
    if (typeof temperature !== "number" || typeof weatherCode !== "number") {
      return null;
    }

    const weather = describeWeather(weatherCode);
    return {
      label: `${Math.round(temperature)}° ${weather.text}`,
      icon: weather.icon
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
