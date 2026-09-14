import * as Sentry from "@sentry/astro";

const CHARLOTTE_COORDINATES = {
  latitude: 35.2271,
  longitude: -80.8431,
};

const WEATHER_LABELS = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "foggy",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "rain showers",
  81: "rain showers",
  82: "heavy showers",
  85: "snow showers",
  86: "heavy snow showers",
  95: "thunderstorms",
  96: "storms with hail",
  99: "storms with hail",
};

export async function fetchCharlotteWeather() {
  const fallback = {
    temperature: null,
    condition: "conditions unavailable",
    error: null,
  };

  try {
    const searchParams = new URLSearchParams({
      latitude: String(CHARLOTTE_COORDINATES.latitude),
      longitude: String(CHARLOTTE_COORDINATES.longitude),
      current: "temperature_2m,weather_code",
      temperature_unit: "fahrenheit",
      timezone: "America/New_York",
    });
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`,
      { signal: AbortSignal.timeout(4_000) },
    );

    if (!response.ok) {
      throw new Error(`Weather request failed (${response.status})`);
    }

    const payload = await response.json();
    const temperature = payload?.current?.temperature_2m;
    const weatherCode = payload?.current?.weather_code;

    if (typeof temperature !== "number" || typeof weatherCode !== "number") {
      throw new Error("Weather response was invalid");
    }

    return {
      temperature: Math.round(temperature),
      condition: WEATHER_LABELS[weatherCode] || "current conditions",
      error: null,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: "weather", method: "fetchCharlotteWeather" },
    });

    return {
      ...fallback,
      error: error instanceof Error ? error.message : "Failed to fetch weather",
    };
  }
}
