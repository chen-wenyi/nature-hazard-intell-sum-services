export type DateString = string; // in ISO format

// issued warnings and watches Types
export type CAP = {
  feed: {
    entry?: Array<{
      id: string;
      link: { href: string };
      published: string;
      updated: string;
      title: string;
      summary: string;
    }>;
    updated: string;
  };
};

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
