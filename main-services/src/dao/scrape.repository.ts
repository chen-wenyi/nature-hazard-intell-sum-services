import { Injectable, Logger } from '@nestjs/common';

import { ObjectId, WithId } from 'mongodb';
import { MongoService } from 'src/database/mongo.service';
import {
  AISevereWeatherOutlookSummaryDocument,
  AIThunderstormOutlookSummaryDocument,
} from 'src/services/ai-generate/typing';
import {
  IssuedAlertEntriesDocument,
  SevereWeatherDoc,
  ThunderstormDoc,
} from './typing';

const ISSUED_ALERTS_COLLECTION = 'issued_alert_entries';
const SEVERE_WEATHER_COLLECTION = 'severe_weather_outlook';
const THUNDERSTORM_COLLECTION = 'thunderstorm_outlook';
const AI_SEVERE_WEATHER_SUMMARY_COLLECTION =
  'ai_severe_weather_outlook_summary';
const AI_THUNDERSTORM_SUMMARY_COLLECTION = 'ai_thunderstorm_outlook_summary';

@Injectable()
export class ScrapeRepository {
  private readonly logger = new Logger(ScrapeRepository.name);

  constructor(private readonly mongoService: MongoService) {}

  async findSevereWeatherOutlookById(
    id: string,
  ): Promise<WithId<SevereWeatherDoc> | null> {
    const collection = this.mongoService.getCollection<SevereWeatherDoc>(
      SEVERE_WEATHER_COLLECTION,
    );
    const record = await collection.findOne({ _id: new ObjectId(id) });
    return record;
  }

  async findThunderstormOutlookById(
    id: string,
  ): Promise<WithId<ThunderstormDoc> | null> {
    const collection = this.mongoService.getCollection<ThunderstormDoc>(
      THUNDERSTORM_COLLECTION,
    );
    const record = await collection.findOne({ _id: new ObjectId(id) });
    return record;
  }

  async findLatestSevereWeatherOutlook(): Promise<SevereWeatherDoc | null> {
    const collection = this.mongoService.getCollection<SevereWeatherDoc>(
      SEVERE_WEATHER_COLLECTION,
    );
    const latestRecord = await collection.findOne(
      {},
      {
        sort: { insertedAt: -1 },
      },
    );

    return latestRecord;
  }

  async findLatestThunderstormOutlook(): Promise<ThunderstormDoc | null> {
    const collection = this.mongoService.getCollection<ThunderstormDoc>(
      THUNDERSTORM_COLLECTION,
    );
    const latestRecord = await collection.findOne(
      {},
      {
        sort: { insertedAt: -1 },
      },
    );

    return latestRecord;
  }

  async insertSevereWeatherOutlook(scrapedOutlook: SevereWeatherDoc) {
    const collection = this.mongoService.getCollection<SevereWeatherDoc>(
      SEVERE_WEATHER_COLLECTION,
    );
    const result = await collection.insertOne(scrapedOutlook);
    this.logger.log(
      `Severe Weather Outlook inserted with id: ${result.insertedId.toString()}`,
    );
    return result;
  }

  async insertThunderstormOutlook(scrapedOutlook: ThunderstormDoc) {
    const collection = this.mongoService.getCollection<ThunderstormDoc>(
      THUNDERSTORM_COLLECTION,
    );
    const result = await collection.insertOne(scrapedOutlook);
    this.logger.log(
      `Thunderstorm Outlook inserted with id: ${result.insertedId.toString()}`,
    );
    return result;
  }

  async findLatestIssuedAlerts(): Promise<IssuedAlertEntriesDocument | null> {
    const collection =
      this.mongoService.getCollection<IssuedAlertEntriesDocument>(
        ISSUED_ALERTS_COLLECTION,
      );
    const latestRecord = await collection.findOne(
      {},
      {
        sort: { insertedAt: -1 },
      },
    );

    return latestRecord;
  }

  async insertIssuedAlerts(
    issuedAlertEntries: IssuedAlertEntriesDocument,
  ): Promise<void> {
    const collection =
      this.mongoService.getCollection<IssuedAlertEntriesDocument>(
        ISSUED_ALERTS_COLLECTION,
      );
    const result = await collection.insertOne(issuedAlertEntries);
    this.logger.log(
      `Issued Alerts inserted with id: ${result.insertedId.toString()}`,
    );
  }

  async insertAiGeneratedSevereWeatherSummary(
    data: AISevereWeatherOutlookSummaryDocument,
  ) {
    const collection =
      this.mongoService.getCollection<AISevereWeatherOutlookSummaryDocument>(
        AI_SEVERE_WEATHER_SUMMARY_COLLECTION,
      );
    await collection.insertOne(data);
    this.logger.log('Collection: ai_severe_weather_outlook_summary updated.');
  }

  async insertAiGeneratedThunderstormSummary(
    data: AIThunderstormOutlookSummaryDocument,
  ) {
    const collection =
      this.mongoService.getCollection<AIThunderstormOutlookSummaryDocument>(
        AI_THUNDERSTORM_SUMMARY_COLLECTION,
      );
    await collection.insertOne(data);
    this.logger.log('Collection: ai_thunderstorm_outlook_summary updated.');
  }
}
