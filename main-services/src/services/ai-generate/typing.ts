import { SevereWeatherAISummary } from './schema';

export type SevereWeatherOutlookDoc = {
  insertedAt: Date;
  issuedDate: string;
  outlookItems: {
    date: string;
    outlook: string;
  }[];
};

export type AISevereWeatherOutlookSummaryDocument = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: SevereWeatherAISummary;
    date: string;
  }[];
};

export type ThunderstormOutlookDoc = {
  insertedAt: Date;
  items: {
    header: string;
    outlook: string;
    issuedDate: string;
  }[];
  refIssuedDates: string[];
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
