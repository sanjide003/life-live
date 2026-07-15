import { PrayerName, PrayerSettings } from '../types';

// Helper: Convert degrees to radians
const degToRad = (deg: number) => (deg * Math.PI) / 180;
// Helper: Convert radians to degrees
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

interface CalculatedPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function calculatePrayerTimes(
  dateStr: string, // YYYY-MM-DD
  settings: PrayerSettings,
  timezoneOffsetHours: number = 5.5 // Default to Indian Standard Time (GMT+5:30)
): CalculatedPrayerTimes {
  const { calculationMethod, school, location, manualOffsets } = settings;
  const { latitude, longitude } = location;

  // 1. Get Day of Year
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // 2. Astronomical calculations for Solar Position
  // Declination
  const d = 23.45 * Math.sin(degToRad((360 / 365) * (284 + dayOfYear)));
  const dRad = degToRad(d);
  const latRad = degToRad(latitude);

  // Equation of Time (in minutes)
  const b = (360 / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(degToRad(2 * b)) - 7.53 * Math.cos(degToRad(b)) - 1.5 * Math.sin(degToRad(b));

  // Solar Noon (transit time) in local hours
  // Noon in UTC is 12 - longitude/15 - eot/60. Then add timezoneOffsetHours.
  const solarNoonUtc = 12 - longitude / 15 - eot / 60;
  const solarNoonLocal = solarNoonUtc + timezoneOffsetHours;

  // Method-specific angles
  let fajrAngle = 18;
  let ishaAngle = 17;
  let ishaIntervalMinutes = 0; // if >0, Isha is calculated as interval after Maghrib

  switch (calculationMethod) {
    case 'ISNA':
      fajrAngle = 15;
      ishaAngle = 15;
      break;
    case 'Egypt':
      fajrAngle = 19.5;
      ishaAngle = 17.5;
      break;
    case 'Makkah':
      fajrAngle = 18.5;
      ishaIntervalMinutes = 90; // 90 minutes after Maghrib
      break;
    case 'Karachi':
      fajrAngle = 18;
      ishaAngle = 18;
      break;
    case 'Tehran':
      fajrAngle = 17.7;
      ishaAngle = 14;
      break;
    case 'Gulf':
      fajrAngle = 19.5;
      ishaIntervalMinutes = 90;
      break;
    case 'MWL':
    default:
      fajrAngle = 18;
      ishaAngle = 17;
      break;
  }

  // Hour Angle helper
  const hourAngle = (angle: number, direction: 'fajr_sunrise' | 'sunset_isha') => {
    const angleRad = degToRad(angle);
    let cosH = (Math.sin(-angleRad) - Math.sin(latRad) * Math.sin(dRad)) / (Math.cos(latRad) * Math.cos(dRad));
    
    // Clamp to [-1, 1] in case of polar region anomalies
    cosH = Math.max(-1, Math.min(1, cosH));
    const hRad = Math.acos(cosH);
    return radToDeg(hRad) / 15; // convert degree to hour
  };

  // Hour Angle for Fajr (uses negative altitude angle = fajrAngle)
  const hFajr = hourAngle(fajrAngle, 'fajr_sunrise');
  // Hour Angle for Sunrise (uses standard refraction 0.833 degrees)
  const hSunrise = hourAngle(0.833, 'fajr_sunrise');
  // Hour Angle for Sunset/Maghrib (uses standard refraction 0.833 degrees)
  const hSunset = hourAngle(0.833, 'sunset_isha');
  // Hour Angle for Isha
  const hIsha = ishaIntervalMinutes > 0 ? 0 : hourAngle(ishaAngle, 'sunset_isha');

  // Hour Angle for Asr (Juristic methods)
  // shadow ratio is 1 for Shafi, 2 for Hanafi
  const shadowRatio = (school === 'Hanafi' ? 2 : 1) + Math.abs(Math.tan(latRad - dRad));
  const asrAngleRad = Math.atan(1 / shadowRatio);
  const asrAngle = radToDeg(asrAngleRad);
  
  let cosHAsr = (Math.sin(asrAngleRad) - Math.sin(latRad) * Math.sin(dRad)) / (Math.cos(latRad) * Math.cos(dRad));
  cosHAsr = Math.max(-1, Math.min(1, cosHAsr));
  const hAsr = radToDeg(Math.acos(cosHAsr)) / 15;

  // Calc base times in decimal hours
  const fajrTimeDecimal = solarNoonLocal - hFajr;
  const sunriseTimeDecimal = solarNoonLocal - hSunrise;
  const dhuhrTimeDecimal = solarNoonLocal; // solar noon is Dhuhr
  const asrTimeDecimal = solarNoonLocal + hAsr;
  const maghribTimeDecimal = solarNoonLocal + hSunset;
  const ishaTimeDecimal = ishaIntervalMinutes > 0 
    ? maghribTimeDecimal + (ishaIntervalMinutes / 60)
    : solarNoonLocal + hIsha;

  // Helper: Format decimal hours to HH:MM string with manual offsets
  const formatTime = (decimalHours: number, offsetMinutes: number) => {
    let totalMinutes = Math.round(decimalHours * 60) + offsetMinutes;
    // Keep in [0, 1439] range
    totalMinutes = (totalMinutes + 1440) % 1440;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  return {
    Fajr: formatTime(fajrTimeDecimal, manualOffsets.Fajr),
    Sunrise: formatTime(sunriseTimeDecimal, 0),
    Dhuhr: formatTime(dhuhrTimeDecimal, manualOffsets.Dhuhr),
    Asr: formatTime(asrTimeDecimal, manualOffsets.Asr),
    Maghrib: formatTime(maghribTimeDecimal, manualOffsets.Maghrib),
    Isha: formatTime(ishaTimeDecimal, manualOffsets.Isha),
  };
}

export function isBeforeTime(time1: string, time2: string): boolean {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return h1 < h2 || (h1 === h2 && m1 < m2);
}

export function getHijriDate(date: Date = new Date()): { day: number; month: string; year: number } {
  // Simple offline tabular Islamic calendar conversion (Kuwaiti / Julian Date based)
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let y = date.getFullYear();
  
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (y + 4716));
  const f = Math.floor(30.6001 * (m + 1));
  const jd = c + d + e + f - 1524.5;
  
  const ijd = Math.floor(jd + 0.5);
  let l = ijd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  m = Math.floor((24 * l) / 709);
  d = l - Math.floor((709 * m) / 24);
  y = 30 * n + j - 30;
  
  const hijriMonths = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Sani",
    "Jumada al-Awwal", "Jumada al-Sani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"
  ];
  
  return {
    day: d,
    month: hijriMonths[m - 1] || "Muharram",
    year: y
  };
}
