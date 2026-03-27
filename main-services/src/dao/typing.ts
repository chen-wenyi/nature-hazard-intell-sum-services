import z from 'zod';

export type SevereWeatherDoc = {
  insertedAt: Date;
  issuedDate: string;
  outlookItems: {
    date: string;
    outlook: string;
  }[];
};

export type ThunderstormDoc = {
  insertedAt: Date;
  items: {
    header: string;
    outlook: string;
    issuedDate: string;
  }[];
  refIssuedDates: string[];
};

export type UpsertStatus = 'inserted' | 'unchanged';

// ALERTS TYPES
export type Alert = {
  identifier: string;
  sent: string;
  references?: string;
  info: {
    // 'category', 'event', 'responseType', 'urgency', 'severity', 'certainty', 'onset', 'expires', 'senderName', 'headline', 'description', 'instruction', 'web', 'parameter', 'area'
    area: {
      areaDesc: string;
      polygon: string[];
    };
    category: string;
    event: string;
    responseType: string;
    urgency: string;
    severity: string;
    certainty: string;
    onset: string;
    expires: string;
    senderName: string;
    headline: string;
    description: string;
    instruction: string;
    web: string;
    parameter: Array<{
      valueName: string;
      value: string;
    }>;
  };
  _history?: Alert[];
};

// Issued Warnings and Watches
export type IssuedAlert = {
  id: string;
  sent: DateString;
  event: string;
  responseType: string;
  urgency: string;
  severity: string;
  certainty: string;
  onset: DateString;
  expires: DateString;
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  _status: 'removed' | 'updated' | 'new' | '';
  _history: IssuedAlert[];
  ColourCode?: string;
  ChanceOfUpgrade?: string;
};

type DateString = string; // in ISO format

export type IssuedAlertEntriesDocument = {
  updatedAt: Date;
  updatedAtISO: DateString;
  entries: IssuedAlert[];
  insertedAt: Date;
};

// zod schemas for validating scrape service responses
export const severeWeatherOutlookResponseSchema = z.object({
  issuedDate: z.string(),
  outlookItems: z.array(
    z.object({
      date: z.string(),
      outlook: z.string(),
    }),
  ),
});

export const thunderstormOutlookResponseSchema = z.array(
  z.object({
    header: z.string(),
    outlook: z.string(),
    issuedDate: z.string(),
  }),
);

export const CAPSchema = z.object({
  feed: z.object({
    entry: z.union([
      z
        .array(
          z.object({
            id: z.string(),
            link: z.object({
              href: z.string(),
            }),
            published: z.string(),
            updated: z.string(),
            title: z.string(),
            summary: z.string(),
          }),
        )
        .optional(),
      z.object({
        id: z.string(),
        link: z.object({
          href: z.string(),
        }),
        published: z.string(),
        updated: z.string(),
        title: z.string(),
        summary: z.string(),
      }),
    ]),
    updated: z.string(),
  }),
});

export type CAP = z.infer<typeof CAPSchema>;
