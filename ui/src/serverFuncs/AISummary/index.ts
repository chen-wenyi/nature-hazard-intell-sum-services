import {
  getAISevereWeatherOutlookSummaryCollection,
  getAIThunderstormOutlookSummaryCollection,
} from '@/lib/mongodb';
import type {
  AISevereWeatherOutlookSummaryResp,
  AIThunderstormOutlookSummaryResp,
} from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const getSevereWeatherOutlookAISummaryById = createServerFn()
  .inputValidator((data: { outlookRefId: string }) => data)
  .handler(
    async ({ data }): Promise<AISevereWeatherOutlookSummaryResp | null> => {
      console.log(
        `Event: Fetching severe weather outlook AI summary for outlook ID: ${data.outlookRefId}...`,
      );

      const collection = await getAISevereWeatherOutlookSummaryCollection();

      const summaryDoc = await collection.findOne(
        {
          outlookRefId: data.outlookRefId,
        },
        { sort: { generatedAt: -1 } },
      );

      if (summaryDoc) {
        console.log(
          `Result: Found severe weather outlook AI summary for outlook ID: ${data.outlookRefId}`,
        );
        return {
          id: summaryDoc._id.toString(),
          outlookRefId: summaryDoc.outlookRefId,
          genReason: summaryDoc.genReason,
          generatedAt: summaryDoc.generatedAt,
          generatedAtISO: summaryDoc.generatedAtISO,
          content: summaryDoc.content,
        };
      } else {
        console.log(
          `Result: No severe weather outlook AI summary found for outlook ID: ${data.outlookRefId}`,
        );
        return null;
      }
    },
  );

export const getThunderstormOutlookAISummaryById = createServerFn()
  .inputValidator((data: { outlookRefId: string }) => data)
  .handler(
    async ({ data }): Promise<AIThunderstormOutlookSummaryResp | null> => {
      console.log(
        `Event: Fetching thunderstorm outlook AI summary for outlook ID: ${data.outlookRefId}...`,
      );

      const collection = await getAIThunderstormOutlookSummaryCollection();

      const summaryDoc = await collection.findOne(
        {
          outlookRefId: data.outlookRefId,
        },
        { sort: { generatedAt: -1 } },
      );

      if (summaryDoc) {
        console.log(
          `Result: Found thunderstorm outlook AI summary for outlook ID: ${data.outlookRefId}`,
        );
        return {
          id: summaryDoc._id.toString(),
          outlookRefId: summaryDoc.outlookRefId,
          genReason: summaryDoc.genReason,
          generatedAt: summaryDoc.generatedAt,
          generatedAtISO: summaryDoc.generatedAtISO,
          content: summaryDoc.content,
        };
      } else {
        console.log(
          `Result: No thunderstorm outlook AI summary found for outlook ID: ${data.outlookRefId}`,
        );
        return null;
      }
    },
  );
