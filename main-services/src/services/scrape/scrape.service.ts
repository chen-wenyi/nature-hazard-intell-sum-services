import { Injectable, Logger } from '@nestjs/common';
import { Rest } from 'ably';
import { XMLParser } from 'fast-xml-parser';
import { intersection } from 'lodash';
import { DateTime } from 'luxon';
import { ScrapeRepository } from 'src/dao/scrape.repository';
import {
  Alert,
  CAPSchema,
  IssuedAlert,
  severeWeatherOutlookResponseSchema,
  thunderstormOutlookResponseSchema,
} from 'src/dao/typing';
import { NHISCHANNEL_EVENTS } from 'src/events';
import { AiGenerateService } from '../ai-generate/ai-generate.service';

@Injectable()
export class ScrapeService {
  private readonly logger = new Logger(ScrapeService.name);

  constructor(
    private readonly scrapeRepository: ScrapeRepository,
    private readonly aiGenerateService: AiGenerateService,
  ) {}

  async updateSevereWeatherOutlook() {
    try {
      await this.ablyPublishToClient({
        event: NHISCHANNEL_EVENTS.SEVERE_WEATHER_OUTLOOK_UPDATING,
        message: 'Retrieving Outlook from MetService...',
        clientId: 'nhis-update-severe-weather-outlook',
      });
      const resp = await fetch(
        `${process.env.SCRAPE_SEVERE_WEATHER_OUTLOOK_URL}`,
      );
      const data = await resp.json();

      const parsedPayload = severeWeatherOutlookResponseSchema.safeParse(data);

      if (!parsedPayload.success) {
        const firstIssue = parsedPayload.error.issues[0];
        const issueSummary = firstIssue
          ? `${firstIssue.path.join('.')} ${firstIssue.message}`
          : 'Unknown validation issue';
        this.logger.error(
          `Invalid severe weather outlook payload: ${issueSummary}`,
        );
        return;
      }

      const scrappedOutlook = parsedPayload.data;
      const scrapedIssuedDate = scrappedOutlook.issuedDate;

      const latestOutlook =
        await this.scrapeRepository.findLatestSevereWeatherOutlook();
      if (!latestOutlook) {
        this.logger.log('No existing Severe Weather Outlook data found in DB.');
        const result = await this.scrapeRepository.insertSevereWeatherOutlook({
          ...scrappedOutlook,
          insertedAt: new Date(),
        });
        const id = result.insertedId.toString();
        this.logger.log(
          'Initial Severe Weather Outlook data inserted with id: ',
          id,
        );
        await this.ablyPublishToClient({
          event: NHISCHANNEL_EVENTS.SEVERE_WEATHER_OUTLOOK_UPDATED,
          message: 'New info available',
          clientId: 'nhis-update-severe-weather-outlook',
          stale: true,
        });

        this.aiGenerateService.generateSevereWeatherOutlookSummary(
          id,
          'Severe weather outlook updated with new data.',
        );
      } else {
        this.logger.log(
          `${latestOutlook.issuedDate} - DB last Severe Weather Outlook Issued Date`,
        );
        this.logger.log(
          `${scrapedIssuedDate} - Scrapped Severe Weather Outlook Issued Date`,
        );
        if (scrapedIssuedDate !== latestOutlook.issuedDate) {
          this.logger.log(
            'New Severe Weather Outlook data found. Updating DB...',
          );
          const result = await this.scrapeRepository.insertSevereWeatherOutlook(
            { ...scrappedOutlook, insertedAt: new Date() },
          );

          const id = result.insertedId.toString();
          this.logger.log(
            'New Severe Weather Outlook data inserted with id: ',
            id,
          );

          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.SEVERE_WEATHER_OUTLOOK_UPDATED,
            message: 'New info available',
            clientId: 'nhis-update-severe-weather-outlook',

            stale: true,
          });

          await this.aiGenerateService.generateSevereWeatherOutlookSummary(
            id,
            'Triggered by initial severe weather outlook',
          );
        } else {
          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.SEVERE_WEATHER_OUTLOOK_UPDATED,
            message: 'All up to date',
            clientId: 'nhis-update-severe-weather-outlook',

            stale: false,
          });
          this.logger.log('Severe Weather Outlook is already up-to-date.');
        }
      }
    } catch (error) {
      const errorMessage = `Error occurred while updating Severe Weather Outlook. ${error}`;
      this.logger.error(errorMessage);
    }
  }

  async updateThunderstormOutlook() {
    try {
      await this.ablyPublishToClient({
        event: NHISCHANNEL_EVENTS.THUNDERSTORM_OUTLOOK_UPDATING,
        clientId: 'nhis-update-thunderstorm-outlook',
        message: 'Retrieving Outlook from MetService...',
      });

      const resp = await fetch(
        `${process.env.SCRAPE_THUNDERSTORM_OUTLOOK_URL}`,
      );
      const data = await resp.json();

      const parsedPayload = thunderstormOutlookResponseSchema.safeParse(data);

      if (!parsedPayload.success) {
        const firstIssue = parsedPayload.error.issues[0];
        const issueSummary = firstIssue
          ? `${firstIssue.path.join('.')} ${firstIssue.message}`
          : 'Unknown validation issue';
        this.logger.error(
          `Invalid thunderstorm outlook payload: ${issueSummary}`,
        );
        return;
      }

      const scrappedOutlook = parsedPayload.data;
      const scrapedIssuedDates = scrappedOutlook.map(
        ({ issuedDate }) => issuedDate,
      );

      const latestOutlook =
        await this.scrapeRepository.findLatestThunderstormOutlook();
      if (!latestOutlook) {
        this.logger.log('No existing Thunderstorm Outlook data found in DB.');
        const result = await this.scrapeRepository.insertThunderstormOutlook({
          insertedAt: new Date(),
          items: scrappedOutlook,
          refIssuedDates: scrapedIssuedDates,
        });
        const id = result.insertedId.toString();
        this.logger.log(
          'Initial Thunderstorm Outlook data inserted with id: ',
          id,
        );
        await this.ablyPublishToClient({
          event: NHISCHANNEL_EVENTS.THUNDERSTORM_OUTLOOK_UPDATED,
          message: 'New info available',
          clientId: 'nhis-update-thunderstorm-outlook',
          failed: false,
          stale: true,
        });
        await this.aiGenerateService.generateThunderstormOutlookSummary(
          id,
          'Triggered by initial thunderstorm outlook',
        );
      } else {
        this.logger.log(
          `${latestOutlook.refIssuedDates} - DB last Thunderstorm Outlook Issued Dates`,
        );
        this.logger.log(
          `${scrapedIssuedDates} - Scrapped Thunderstorm Outlook Issued Dates`,
        );
        if (
          scrapedIssuedDates.toString() !==
          latestOutlook.refIssuedDates.toString()
        ) {
          this.logger.log(
            'New Thunderstorm Outlook data found. Updating DB...',
          );
          const result = await this.scrapeRepository.insertThunderstormOutlook({
            insertedAt: new Date(),
            refIssuedDates: scrapedIssuedDates,
            items: scrappedOutlook,
          });
          const id = result.insertedId.toString();

          this.logger.log(
            'New Thunderstorm Outlook data inserted with id: ',
            id,
          );

          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.THUNDERSTORM_OUTLOOK_UPDATED,
            message: 'New info available',
            clientId: 'nhis-update-thunderstorm-outlook',
            failed: false,
            stale: true,
          });

          await this.aiGenerateService.generateThunderstormOutlookSummary(
            id,
            'Triggered by new thunderstorm outlook',
          );
        } else {
          this.logger.log(
            'Thunderstorm Outlook data is already up-to-date. No update needed.',
          );
          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.THUNDERSTORM_OUTLOOK_UPDATED,
            message: 'All up to date',
            clientId: 'nhis-update-thunderstorm-outlook',
            failed: false,
            stale: false,
          });
        }
      }
    } catch (error) {
      const errorMessage = `Error occurred while updating Thunderstorm Outlook. ${error}`;
      this.logger.error(errorMessage);
    }
  }

  async updateIssuedAlerts() {
    this.logger.log('*** Event: Querying issued warnings and watches ***');
    try {
      await this.ablyPublishToClient({
        event: NHISCHANNEL_EVENTS.ISSUED_ALERTS_UPDATING,
        message: 'Retrieving Alerts from MetService...',
        clientId: 'nhis-update-issued-alerts',
      });
      const resp = await fetch(`${process.env.METSERVICE_CAP_URL}`);
      const data = await resp.text();

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const parsedPayload = CAPSchema.safeParse(parser.parse(data));

      if (!parsedPayload.success) {
        const firstIssue = parsedPayload.error.issues[0];
        const issueSummary = firstIssue
          ? `${firstIssue.path.join('.')} ${firstIssue.message}`
          : 'Unknown validation issue';
        this.logger.error(`Invalid CAP feed payload: ${issueSummary}`);
        return;
      }

      const { feed } = parsedPayload.data;

      if (!feed.entry) {
        feed.entry = [];
      }
      // if entry is single object, convert to array
      if (!Array.isArray(feed.entry)) {
        feed.entry = [feed.entry];
      }

      const alerts = await Promise.all(
        feed.entry.map(async (entry) => {
          const alertResponse = await fetch(entry.link.href);
          const alertData = await alertResponse.text();
          const alertObj = parser.parse(alertData);
          const { alert } = alertObj as { alert: Alert };
          if (alert.references) {
            alert._history = await this.fetchAlertHistory(alert.identifier);
          } else {
            alert._history = [];
          }
          return alert;
        }),
      );

      const issuedWarningsAndWatches: IssuedAlert[] = alerts.map((alert) =>
        this.convertAlertToIssuedAlert(alert),
      );

      const latestRecord = await this.scrapeRepository.findLatestIssuedAlerts();
      this.logger.log(`${feed.updated} - Queried feed updated at`);
      this.logger.log(
        `${latestRecord?.updatedAtISO} - Latest Feed from DB updated at`,
      );

      if (latestRecord?.updatedAtISO === feed.updated) {
        this.logger.log('Issued Alerts are already up-to-date.');
        await this.ablyPublishToClient({
          event: NHISCHANNEL_EVENTS.ISSUED_ALERTS_UPDATED,
          message: 'All up to date',
          clientId: 'nhis-update-issued-alerts',
          failed: false,
          stale: false,
        });
      } else if (latestRecord) {
        // different updatedAt, need to check if same day
        const newFeedUpdatedAt = DateTime.fromISO(feed.updated, {
          setZone: true,
        });
        const previousFeedUpdatedAt = DateTime.fromISO(
          latestRecord.updatedAtISO,
          { setZone: true },
        );
        const newFeedUpdatedAtFormatted = newFeedUpdatedAt.toFormat('yyyyLLdd');
        const previousFeedUpdatedAtFormatted =
          previousFeedUpdatedAt.toFormat('yyyyLLdd');

        this.logger.log(
          'checking newFeedUpdatedAt timezone:',
          newFeedUpdatedAt.zoneName,
        );
        this.logger.log(
          'checking previousFeedUpdatedAt timezone:',
          previousFeedUpdatedAt.zoneName,
        );
        this.logger.log(
          'Comparing new feed update dates:',
          newFeedUpdatedAtFormatted,
          'and previous feed update dates:',
          previousFeedUpdatedAtFormatted,
        );

        this.logger.log(
          'Result: Different feed updatedAt detected, Comparing dates.',
        );

        if (
          // same day month and year
          newFeedUpdatedAtFormatted === previousFeedUpdatedAtFormatted
        ) {
          this.logger.log(
            'Same day update detected. Updating existing entries with new statuses and inserting new record.',
          );
          await this.scrapeRepository.insertIssuedAlerts({
            updatedAt: new Date(feed.updated),
            updatedAtISO: feed.updated,
            entries: this.updateStatus(
              issuedWarningsAndWatches,
              latestRecord.entries,
            ),
            insertedAt: new Date(),
          });
          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.ISSUED_ALERTS_UPDATED,
            message: 'New info available',
            clientId: 'nhis-update-issued-alerts',
            failed: false,
            stale: true,
          });
        } else {
          this.logger.log(
            'Result: New day update detected. Inserting new entries.',
          );
          // new day
          await this.scrapeRepository.insertIssuedAlerts({
            updatedAt: new Date(feed.updated),
            updatedAtISO: feed.updated,
            entries: issuedWarningsAndWatches,
            insertedAt: new Date(),
          });
          await this.ablyPublishToClient({
            event: NHISCHANNEL_EVENTS.ISSUED_ALERTS_UPDATED,
            message: 'New info available',
            clientId: 'nhis-update-issued-alerts',
            failed: false,
            stale: true,
          });
        }
      } else {
        this.logger.log('No existing data found. Inserting initial data.');
        await this.scrapeRepository.insertIssuedAlerts({
          updatedAt: new Date(feed.updated),
          updatedAtISO: feed.updated,
          entries: issuedWarningsAndWatches,
          insertedAt: new Date(),
        });
        await this.ablyPublishToClient({
          event: NHISCHANNEL_EVENTS.ISSUED_ALERTS_UPDATED,
          message: 'New info available',
          clientId: 'nhis-update-issued-alerts',
          failed: false,
          stale: true,
        });
      }
      this.logger.log('*** Finished querying issued warnings and watches ***');
    } catch (error) {
      const errorMessage = `Error occurred while updating Issued Alerts. ${error}`;
      this.logger.error(errorMessage);
    }
  }

  private async fetchAlertById(id: string): Promise<Alert> {
    const alertResponse = await fetch(
      `https://alerts.metservice.com/cap/alert?id=${id}`,
    );
    const alertData = await alertResponse.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const { alert } = parser.parse(alertData);

    return alert as Alert;
  }
  private async fetchAlertHistory(id: string): Promise<Alert[]> {
    const history: Alert[] = [];
    let currentId: string = id;

    while (currentId) {
      const alert = await this.fetchAlertById(currentId);
      history.push(alert);

      // Get the reference ID from the alert (if exists)
      if (alert.references) {
        // references format: "sender,identifier,sent"
        currentId = alert.references.split(',')[1];
      } else {
        currentId = '';
      }
    }

    return history;
  }
  private convertAlertToIssuedAlert(alert: Alert): IssuedAlert {
    const _history =
      alert._history?.map((histAlert) => {
        return this.convertAlertToIssuedAlert(histAlert);
      }) || [];
    return {
      id: alert.identifier,
      sent: alert.sent,
      event: alert.info.event,
      responseType: alert.info.responseType,
      urgency: alert.info.urgency,
      severity: alert.info.severity,
      certainty: alert.info.certainty,
      onset: alert.info.onset,
      expires: alert.info.expires,
      headline: alert.info.headline,
      description: alert.info.description,
      instruction: alert.info.instruction,
      areaDesc: alert.info.area.areaDesc,
      ColourCode: this.getColourCode(alert),
      ChanceOfUpgrade: this.getChanceOfUpgrade(alert),
      _status: '',
      _history,
    };
  }
  private getColourCode(alert: Alert): string | undefined {
    return alert.info.parameter.find((p) => p.valueName === 'ColourCode')
      ?.value;
  }
  private getChanceOfUpgrade(alert: Alert): string | undefined {
    return alert.info.parameter.find((p) => p.valueName === 'ChanceOfUpgrade')
      ?.value;
  }
  private updateStatus(
    newEntries: IssuedAlert[],
    oldEntries: IssuedAlert[],
  ): IssuedAlert[] {
    const newIds = newEntries.map((e) => e.id);
    const oldIds = oldEntries.map((e) => e.id);

    this.logger.log('New IDs:', newIds);
    this.logger.log('Old IDs:', oldIds);

    const updatedEntries: IssuedAlert[] = newEntries.map((entry) => {
      if (!oldIds.includes(entry.id)) {
        if (
          intersection(
            oldIds,
            entry._history.map((h) => h.id),
          ).length > 0
        ) {
          // oldIds exist in entry history ids
          return { ...entry, _status: 'updated' };
        } else {
          return { ...entry, _status: 'new' };
        }
      }
      return entry;
    });

    const allIds = [
      ...newIds,
      ...newEntries.flatMap(({ _history }) => _history.map((h) => h.id)),
    ];

    oldEntries
      .filter((entry) => !allIds.includes(entry.id))
      .forEach((removedEntry) => {
        updatedEntries.push({ ...removedEntry, _status: 'removed' });
      });

    return updatedEntries;
  }
  private async ablyPublishToClient({
    event,
    message,
    clientId,
    failed = false,
    stale = false,
  }: {
    event: string;
    message: string;
    clientId: string;
    failed?: boolean;
    stale?: boolean;
  }) {
    const ablyClient = new Rest({
      key: process.env.ABLY_API_KEY,
      clientId,
    });
    const channel = ablyClient.channels.get(process.env.ABLY_CHANNEL_NAME!);
    await channel.publish(event, { message, failed, stale });
  }
}
