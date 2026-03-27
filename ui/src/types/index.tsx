import type { DateString, IssuedAlert } from './alert';

export type AISummaryId = {
  thunderstormOutlook: string;
  severeWeatherOutlook: string;
  issuedWarningsAndWatches: string;
};

export type IssuedAlertEntries = {
  id: string;
  updatedAt: Date;
  updatedAtISO: DateString;
  entries: IssuedAlert[];
  insertedAt: Date; // need for AI GeneratedAt
};

// Severe Weather Outlook Types
export type SevereWeatherOutlook = {
  id: string;
  issuedDate: string;
  outlookItems: SevereWeatherOutlookItem[];
};

export type SevereWeatherOutlookResp = {
  issuedDate: string;
  outlookItems: SevereWeatherOutlookItem[];
};

export type SevereWeatherOutlookItem = {
  date: string;
  outlook: string;
};

export type ThunderstormOutlookResp = ThunderstormOutlookItem[];

export type ThunderstormOutlook = {
  id: string;
  items: ThunderstormOutlookItem[];
  refIssuedDates: string[];
};

export type ThunderstormOutlookItem = {
  header: string;
  outlook: string;
  issuedDate: string;
};

// NOAA Geomagnetic Forecast Types
export type GeomagneticForecastData = {
  issuedDate: string;
  scales: GeomagneticScale[];
};

export type GeomagneticScale = {
  dateStamp: string;
  value: string;
  text: string;
};

type NOAAGeomagneticScale = {
  Scale: string | null;
  Text: string | null;
};

type NOAAScale = {
  DateStamp: string;
  TimeStamp: string;
  G: NOAAGeomagneticScale;
};

export type NOAAData = {
  [key: string]: NOAAScale;
};

// Volcanic Activity Types
interface VolcanoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    acc: 'Green' | 'Yellow' | 'Orange' | 'Red';
    activity: string;
    hazards: string;
    level: number;
    volcanoID: string;
    volcanoTitle: string;
  };
}

export interface VolcanoFeatureCollection {
  features: VolcanoFeature[];
}

type VolcanicActivity = {
  volcanoTitle: string;
  level: number;
  activity: string;
  acc: 'Green' | 'Yellow' | 'Orange' | 'Red';
};

export type VolcanicActivityData = VolcanicActivity[];

// MongoDB Document Types
export type SevereWeatherOutlookDocument = Omit<SevereWeatherOutlook, 'id'> & {
  insertedAt: Date;
};

export type ThunderstormOutlookDocument = Omit<ThunderstormOutlook, 'id'> & {
  insertedAt: Date;
};

export type IssuedAlertEntriesDocument = Omit<IssuedAlertEntries, 'id'>;

export type AISevereWeatherOutlookSummaryDocument = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: {
      upgradeTo:
        | 'Heavy Rain Watch'
        | 'Strong Wind Watch'
        | 'Heavy Snow Watch'
        | 'Heavy Rain Warning'
        | 'Strong Wind Warning'
        | 'Heavy Snow Warning'
        | 'Red Warning';
      chance: 'Minimal' | 'Low' | 'Moderate' | 'High';
      areas: string[];
      quotes: string[];
      keywords: string[];
    }[];
    date: string;
  }[];
};

export type AIThunderstormOutlookSummaryDocument = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: {
      risk: 'Minimal' | 'Low' | 'Moderate' | 'High';
      areas: string[];
      when: string[];
      quotes: string[];
      keywords: string[];
    }[];
    date: string;
  }[];
};

export type AISevereWeatherOutlookSummaryResp =
  AISevereWeatherOutlookSummaryDocument & { id: string };

export type AIThunderstormOutlookSummaryResp =
  AIThunderstormOutlookSummaryDocument & { id: string };

// export type ThunderstormOutlookAISummary = {
//   outlooks: {
//     risk: 'Minimal' | 'Low' | 'Moderate' | 'High';
//     areas: string[];
//     when: string[];
//     quotes: string[];
//     keywords: string[];
//   }[];
// };

// export type SevereWeatherOutlookAISummary = {
//   upgradeTo:
//     | 'Heavy Rain Watch'
//     | 'Strong Wind Watch'
//     | 'Heavy Snow Watch'
//     | 'Heavy Rain Warning'
//     | 'Strong Wind Warning'
//     | 'Heavy Snow Warning'
//     | 'Red Warning';
//   chance: 'Minimal' | 'Low' | 'Moderate' | 'High';
//   areas: string[];
//   quotes: string[];
//   keywords: string[];
// }[];
