"use client"

import { useMemo, useState } from "react"
import { Brain, ChevronDown, Cloud, CloudRain, CloudSun, MapPin, Moon, Sun, Wind } from "lucide-react"

type DailyForecast = {
  day: string
  date: string
  condition: WeatherCondition
  high: number
  low: number
  precipitation: number
}

type WeatherCondition = "Sunny" | "Partly Cloudy" | "Cloudy" | "Rain Showers" | "Windy"

type ClimateProfileKey =
  | "inland"
  | "mountainEdge"
  | "coastal"
  | "coastalWind"
  | "arid"
  | "coastalSun"
  | "desertCoastal"

type CitySeed = {
  currentTemp: number
  condition: WeatherCondition
  solarFactor: number
  baseHigh: number
  baseLow: number
  profile: ClimateProfileKey
}

type CityWeatherData = {
  currentTemp: number
  condition: WeatherCondition
  solarFactor: number
  forecast: DailyForecast[]
}

const BATTERY_CAPACITY_KWH = 10
const LOAD_KWH = 2

const DAILY_HIGH_OFFSET = [0, -1, -2, -4, -6, -7, -5]
const DAILY_LOW_OFFSET = [0, 0, -1, -2, -3, -4, -4]

// Local simulated API seed for Moroccan cities.
const CITY_SEED: Record<string, CitySeed> = {
  Fes: { currentTemp: 23, condition: "Partly Cloudy", solarFactor: 0.82, baseHigh: 24, baseLow: 13, profile: "inland" },
  Taza: { currentTemp: 21, condition: "Sunny", solarFactor: 0.78, baseHigh: 22, baseLow: 12, profile: "mountainEdge" },
  Rabat: { currentTemp: 20, condition: "Rain Showers", solarFactor: 0.68, baseHigh: 21, baseLow: 13, profile: "coastal" },
  Casa: { currentTemp: 20, condition: "Cloudy", solarFactor: 0.64, baseHigh: 21, baseLow: 14, profile: "coastal" },
  Tanger: { currentTemp: 18, condition: "Windy", solarFactor: 0.59, baseHigh: 19, baseLow: 12, profile: "coastalWind" },
  Marrakech: { currentTemp: 28, condition: "Sunny", solarFactor: 0.92, baseHigh: 29, baseLow: 16, profile: "arid" },
  Agadir: { currentTemp: 24, condition: "Sunny", solarFactor: 0.88, baseHigh: 25, baseLow: 17, profile: "coastalSun" },
  Oujda: { currentTemp: 26, condition: "Sunny", solarFactor: 0.84, baseHigh: 27, baseLow: 15, profile: "inland" },
  Meknes: { currentTemp: 22, condition: "Partly Cloudy", solarFactor: 0.79, baseHigh: 23, baseLow: 12, profile: "inland" },
  Laayoune: { currentTemp: 27, condition: "Sunny", solarFactor: 0.96, baseHigh: 28, baseLow: 19, profile: "desertCoastal" },
}

const CLIMATE_PROFILES: Record<ClimateProfileKey, { conditions: WeatherCondition[]; precipitation: number[] }> = {
  inland: {
    conditions: ["Partly Cloudy", "Sunny", "Partly Cloudy", "Cloudy", "Rain Showers", "Sunny", "Cloudy"],
    precipitation: [5, 8, 15, 35, 70, 65, 25],
  },
  mountainEdge: {
    conditions: ["Sunny", "Partly Cloudy", "Sunny", "Cloudy", "Rain Showers", "Rain Showers", "Cloudy"],
    precipitation: [8, 12, 14, 32, 58, 47, 20],
  },
  coastal: {
    conditions: ["Cloudy", "Partly Cloudy", "Rain Showers", "Cloudy", "Rain Showers", "Cloudy", "Partly Cloudy"],
    precipitation: [22, 18, 36, 28, 46, 31, 24],
  },
  coastalWind: {
    conditions: ["Windy", "Cloudy", "Partly Cloudy", "Rain Showers", "Windy", "Cloudy", "Rain Showers"],
    precipitation: [18, 16, 21, 39, 22, 29, 34],
  },
  arid: {
    conditions: ["Sunny", "Sunny", "Partly Cloudy", "Sunny", "Windy", "Sunny", "Partly Cloudy"],
    precipitation: [1, 2, 4, 1, 3, 1, 5],
  },
  coastalSun: {
    conditions: ["Sunny", "Partly Cloudy", "Sunny", "Sunny", "Cloudy", "Partly Cloudy", "Sunny"],
    precipitation: [3, 7, 5, 2, 12, 10, 6],
  },
  desertCoastal: {
    conditions: ["Sunny", "Sunny", "Windy", "Sunny", "Partly Cloudy", "Sunny", "Sunny"],
    precipitation: [0, 1, 2, 0, 3, 0, 1],
  },
}

function formatWeekSlots(): Array<{ day: string; date: string }> {
  const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" })
  const today = new Date()
  const slots: Array<{ day: string; date: string }> = []

  for (let i = 0; i < 7; i += 1) {
    const current = new Date(today)
    current.setDate(today.getDate() + i)

    const day = dayFormatter.format(current).replace(".", "").toUpperCase()
    const date = dateFormatter.format(current)

    slots.push({ day, date })
  }

  return slots
}

function buildForecast(seed: CitySeed): DailyForecast[] {
  const profile = CLIMATE_PROFILES[seed.profile]
  const week = formatWeekSlots()

  return week.map((slot, index) => ({
    day: slot.day,
    date: slot.date,
    condition: profile.conditions[index],
    high: Math.round(seed.baseHigh + DAILY_HIGH_OFFSET[index]),
    low: Math.round(seed.baseLow + DAILY_LOW_OFFSET[index]),
    precipitation: profile.precipitation[index],
  }))
}



function calculateAutonomyHours(solarFactor: number, batteryCapacity = BATTERY_CAPACITY_KWH, load = LOAD_KWH): number {
  if (load <= 0) {
    return 0
  }
  return (batteryCapacity / load) * solarFactor
}

function getSolarAvailabilityFactor(hour: number): number {
  if (hour >= 9 && hour <= 16) return 1
  if (hour >= 7 && hour <= 8) return 0.62
  if (hour >= 17 && hour <= 18) return 0.55
  if (hour >= 19 && hour <= 20) return 0.38
  return 0.18
}

function getPeriodLabel(hour: number): string {
  if (hour >= 6 && hour < 12) return "Matin"
  if (hour >= 12 && hour < 18) return "Apres-midi"
  if (hour >= 18 && hour < 22) return "Soir"
  return "Nuit"
}

function getWeatherIcon(condition: WeatherCondition) {
  if (condition === "Sunny") return <Sun className="h-7 w-7 text-amber-400" />
  if (condition === "Partly Cloudy") return <CloudSun className="h-7 w-7 text-yellow-500" />
  if (condition === "Cloudy") return <Cloud className="h-7 w-7 text-slate-500" />
  if (condition === "Rain Showers") return <CloudRain className="h-7 w-7 text-sky-500" />
  return <Wind className="h-7 w-7 text-blue-500" />
}

function getCurrentConditionIcon(condition: WeatherCondition) {
  if (condition === "Sunny") return <Sun className="h-4 w-4 text-amber-500" />
  if (condition === "Partly Cloudy") return <CloudSun className="h-4 w-4 text-yellow-500" />
  if (condition === "Cloudy") return <Cloud className="h-4 w-4 text-slate-500" />
  if (condition === "Rain Showers") return <CloudRain className="h-4 w-4 text-sky-500" />
  return <Wind className="h-4 w-4 text-blue-500" />
}

export function WeatherForecast() {
  const [selectedCity, setSelectedCity] = useState("Fes")
  const [status, setStatus] = useState("API locale simulee • 10 villes marocaines")

  const cityData = WEATHER_API[selectedCity]
  const currentHour = useMemo(() => new Date().getHours(), [selectedCity])
  const periodLabel = useMemo(() => getPeriodLabel(currentHour), [currentHour])
  const solarAvailability = useMemo(() => getSolarAvailabilityFactor(currentHour), [currentHour])
  const effectiveSolarFactor = useMemo(
    () => cityData.solarFactor * solarAvailability,
      const [weather, setWeather] = useState<CityWeatherData | null>(null)
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)

      useEffect(() => {
        async function fetchWeather() {
          setLoading(true)
          setError(null)
          try {
            // Get lat/lon for Fes
            const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=Fes,MA&limit=1&appid=b8ac75ca1be847255b736230cf905c6e`)
            const geo = await geoRes.json()
            if (!geo[0]) throw new Error("City not found")
            const { lat, lon } = geo[0]
            // Fetch 7-day forecast
            const res = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=b8ac75ca1be847255b736230cf905c6e`)
            const data: OWMWeather = await res.json()
            setWeather({
              currentTemp: Math.round(data.current.temp),
              condition: mapOWMCondition(data.current.weather[0]?.main),
              solarFactor: 1, // not available from OWM
              forecast: mapOWMToForecast(data),
            })
          } catch (e: any) {
            setError(e.message || "Error fetching weather")
          } finally {
            setLoading(false)
          }
        }
        fetchWeather()
      }, [])

      if (loading) return <div>Loading weather...</div>
      if (error) return <div>Error: {error}</div>
      if (!weather) return <div>No weather data</div>

      return (
        <section className="space-y-4">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/55 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-[15px] dark:border-emerald-400/20 dark:bg-[linear-gradient(165deg,rgba(15,23,42,0.62),rgba(6,78,59,0.36)_52%,rgba(14,116,144,0.34))] dark:shadow-[0_18px_36px_rgba(2,6,23,0.45)] sm:p-5">
            <div className="mb-4 rounded-[18px] border border-emerald-300/70 bg-[linear-gradient(165deg,rgba(236,253,245,0.94),rgba(255,255,255,0.86)_54%,rgba(224,242,254,0.78))] p-4 shadow-[0_12px_24px_rgba(16,185,129,0.12)] dark:border-emerald-400/30 dark:bg-[linear-gradient(165deg,rgba(6,78,59,0.48),rgba(15,23,42,0.78)_58%,rgba(14,116,144,0.46))] dark:shadow-[0_14px_26px_rgba(2,6,23,0.38)] sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">Météo en temps réel</p>
                  <div className="flex flex-wrap items-end gap-2">
                    <p className="text-4xl font-black leading-none text-emerald-800 dark:text-emerald-100 sm:text-5xl">
                      {weather.currentTemp}°C
                    </p>
                    <span className="rounded-full border border-emerald-400/70 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700 dark:border-emerald-300/45 dark:bg-emerald-400/18 dark:text-emerald-200">
                      {weather.condition}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-emerald-200/80">Prévisions OpenWeatherMap pour Fes</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                    <MapPin className="h-4 w-4" />
                    Fes
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                    {getCurrentConditionIcon(weather.condition)}
                    {weather.currentTemp}°C • {weather.condition}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-emerald-200/70">
              <span>API OpenWeatherMap • Données réelles</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
            {weather.forecast.map((d, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-slate-200/70 bg-white/60 p-3 text-center shadow-[0_2px_8px_rgba(16,185,129,0.08)] dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:shadow-[0_2px_8px_rgba(2,6,23,0.18)]"
              >
                <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                  {d.day} <span className="text-[10px] text-slate-400">({d.date})</span>
                </div>
                {getWeatherIcon(d.condition)}
                <div className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-100">
                  {d.high}° / {d.low}°
                </div>
                <div className="text-[11px] text-slate-500 dark:text-emerald-200/70">{d.precipitation}% Pluie</div>
                <div className="text-xs text-slate-600 dark:text-emerald-200/80">{d.condition}</div>
              </div>
            ))}
          </div>
        </section>
      )
    }
              {selectedCity}
            </h2>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Weather + autonomie energetique</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              {getCurrentConditionIcon(cityData.condition)}
              {cityData.currentTemp}
              {"°C • "}
              {cityData.condition}
            </p>
          </div>

          <div className="relative w-full max-w-[380px]">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
            <select
              className="w-full appearance-none rounded-[14px] border border-slate-300/70 bg-white/70 py-2 pl-9 pr-9 text-sm text-foreground outline-none transition-colors focus:border-emerald-500/60 dark:border-emerald-300/35 dark:bg-slate-900/55 dark:text-slate-100 dark:focus:border-emerald-400/55"
              value={selectedCity}
              onChange={(event) => handleCitySelect(event.target.value)}
              aria-label="Selectionner la ville"
            >
              {CITY_NAMES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {cityData.forecast.map((day, index) => (
            <article
              key={`${selectedCity}-${day.day}-${index}`}
              className={`rounded-[18px] border p-3 text-center ${
                index === 0
                  ? "border-emerald-300/80 bg-emerald-50/70 shadow-[0_8px_18px_rgba(16,185,129,0.18)] dark:border-emerald-300/45 dark:bg-emerald-950/38 dark:shadow-[0_10px_20px_rgba(2,6,23,0.35)]"
                  : "border-slate-200/70 bg-white/75 dark:border-emerald-300/25 dark:bg-slate-900/52"
              }`}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-100">{day.day}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">({day.date})</p>

              <div className="my-2 flex justify-center">{getWeatherIcon(day.condition)}</div>

              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {day.high}
                {"° / "}
                {day.low}
                °
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">{day.precipitation}% Pluie</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">{day.condition}</p>
            </article>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">{status}</p>
      </div>
    </section>
  )
}
