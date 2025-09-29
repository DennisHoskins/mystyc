export interface DailyVisit {
  date: string;
  count: number;
}

export interface PageCount {
  path: string;
  count: number;
  percentage: number;
}

export interface DeviceCount {
  deviceName: string;
  count: number;
  percentage: number;
}

export interface HourlyVisit {
  hour: string;
  count: number;
  percentage: number;
}

export interface TimezoneHourlyVisit {
  hour: string;
  count: number;
  percentage: number;
}

export interface DayOfWeekVisit {
  name: string; // monday, tuesday, etc.
  count: number;
  percentage: number;
}

export interface BrowserCount {
  browser: string;
  count: number;
  percentage: number;
}

export interface OSCount {
  os: string;
  count: number;
  percentage: number;
}

export interface DeviceTypeCount {
  type: string; // desktop, mobile, tablet
  count: number;
  percentage: number;
}

export interface TimezoneCount {
  timezone: string;
  count: number;
  percentage: number;
}

export interface LanguageCount {
  language: string;
  count: number;
  percentage: number;
}

export interface BrowserDeviceCount {
  combination: string; // e.g. "chrome mobile", "safari desktop"
  count: number;
  percentage: number;
}

export interface BrowserDeviceDetailedCount {
  combination: string; // e.g. "chrome 120 mobile", "safari 17 desktop"
  count: number;
  percentage: number;
}

export interface PlatformDeviceCount {
  combination: string; // e.g. "iOS 17 mobile", "Windows 11 desktop"
  count: number;
  percentage: number;
}

export interface FullCombinationCount {
  combination: string; // e.g. "chrome iOS mobile", "firefox Windows desktop"
  count: number;
  percentage: number;
}

export interface UserTypeCounts {
  visitor: number;
  authenticated: number;
}

export interface TrafficStats {
  visitors: {
    totalVisits: number;
    dailyVisits: DailyVisit[];
  };
  pages: PageCount[];
  devices: DeviceCount[];
  userTypes: UserTypeCounts;
  hourlyVisits: HourlyVisit[];
  timezoneHourlyVisits: TimezoneHourlyVisit[];
  dayOfWeekVisits: DayOfWeekVisit[];
  browsers: BrowserCount[];
  oses: OSCount[];
  deviceTypes: DeviceTypeCount[];
  timezones: TimezoneCount[];
  languages: LanguageCount[];
  browserDevices: BrowserDeviceCount[];
  browserDevicesDetailed: BrowserDeviceDetailedCount[];
  platformDevices: PlatformDeviceCount[];
  fullCombinations: FullCombinationCount[];
}