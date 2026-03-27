import {
  getIssuedAlertCollection,
  getSevereWeatherOutlookCollection,
  getThunderstormOutlookCollection,
} from '@/lib/mongodb';
import type {
  IssuedAlertEntries,
  SevereWeatherOutlook,
  ThunderstormOutlook,
} from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const getLatestIssuedAlerts = createServerFn().handler(
  async (): Promise<IssuedAlertEntries | null> => {
    const collection = await getIssuedAlertCollection();
    const issuedAlertEntries = await collection.findOne(
      {},
      { sort: { insertedAt: -1 } },
    );

    if (issuedAlertEntries) {
      return {
        id: issuedAlertEntries._id.toString() || '',
        updatedAt: issuedAlertEntries.updatedAt,
        updatedAtISO: issuedAlertEntries.updatedAtISO,
        entries: issuedAlertEntries.entries,
        insertedAt: issuedAlertEntries.insertedAt,
      };
    }
    return null;
  },
);

export const fetchSevereWeatherOutlook = createServerFn().handler(
  async (): Promise<SevereWeatherOutlook | null> => {
    const collection = await getSevereWeatherOutlookCollection();
    const outlook = await collection.findOne({}, { sort: { insertedAt: -1 } });
    if (!outlook) {
      console.warn('No Severe Weather Outlook data found in the database.');
      return null;
    }

    return {
      id: outlook._id.toString(),
      issuedDate: outlook.issuedDate,
      outlookItems: outlook.outlookItems,
    };
  },
);

export const fetchThunderstormOutlook = createServerFn().handler(
  async (): Promise<ThunderstormOutlook | undefined> => {
    const collection = await getThunderstormOutlookCollection();
    const outlook = await collection.findOne({}, { sort: { insertedAt: -1 } });
    if (!outlook) {
      console.warn('No Severe Weather Outlook data found in the database.');
      return undefined;
    }

    return {
      id: outlook._id.toString(),
      items: outlook.items,
      refIssuedDates: outlook.refIssuedDates,
    };
  },
);
