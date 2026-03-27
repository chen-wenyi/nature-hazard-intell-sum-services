import { Injectable, Logger } from '@nestjs/common';
import { Rest } from 'ably';
import { DateTime } from 'luxon';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.js';
import { ScrapeRepository } from 'src/dao/scrape.repository';
import { NHISCHANNEL_EVENTS } from 'src/events';
import {
  SevereWeatherAISummarySchema,
  ThunderstormAISummarySchema,
} from './schema';
import {
  createSevereWeatherUserPrompt,
  severeWeatherSystemPrompt,
} from './severeWeatherPropmt';
import {
  createThunderstormUserPrompt,
  thunderstormSystemPrompt,
} from './thunderstormPropmt';

@Injectable()
export class AiGenerateService {
  private readonly logger = new Logger(AiGenerateService.name);

  constructor(private readonly scrapeRepository: ScrapeRepository) {}

  async generateSevereWeatherOutlookSummary(
    outlookRefId: string,
    reason: string,
  ) {
    this.logger.log(
      '****** Generating severe weather outlook AI summary ******',
    );
    this.logger.log(`Reason for generation: ${reason}`);
    this.logger.log(`Severe weather outlook Id: ${outlookRefId}`);

    const outlook =
      await this.scrapeRepository.findSevereWeatherOutlookById(outlookRefId);
    if (!outlook) {
      this.logger.error(
        `Severe weather outlook not found for ID: ${outlookRefId}`,
      );
      return;
    } else {
      this.logger.log(
        '--- Start Generating Severe Weather Outlook AI Summary ---',
      );
      this.ablyPublishToClient(
        NHISCHANNEL_EVENTS.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATING,
        outlook._id.toString(),
      );

      const ai_resps = await Promise.all(
        outlook.outlookItems.map((item) => {
          return this.invokeSevereWeatherChatCompletion(item.outlook);
        }),
      );
      this.logger.log('AI Summary generated.');
      const generatedAt = new Date();
      this.scrapeRepository.insertAiGeneratedSevereWeatherSummary({
        outlookRefId: outlook._id.toString(),
        genReason: reason,
        generatedAt: generatedAt,
        generatedAtISO:
          DateTime.fromJSDate(generatedAt)
            .setZone('Pacific/Auckland')
            .toISO() || '',
        content: ai_resps.map((summary, idx) => ({
          summary,
          date: outlook.outlookItems[idx].date,
        })),
      });
      this.logger.log('Collection: ai_severe_weather_outlook_summary updated.');

      await this.ablyPublishToClient(
        NHISCHANNEL_EVENTS.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATED,
        outlook._id.toString(),
      );
    }
    this.logger.log('Channel message sent.');
    this.logger.log('--- End Generating AI Summary ---');
  }

  async generateThunderstormOutlookSummary(
    outlookRefId: string,
    reason: string,
  ) {
    this.logger.log('****** Generating thunderstorm outlook AI summary ******');
    this.logger.log(`Reason for generation: ${reason}`);
    this.logger.log(`Thunderstorm outlook Id: ${outlookRefId}`);

    const outlook =
      await this.scrapeRepository.findThunderstormOutlookById(outlookRefId);
    if (!outlook) {
      this.logger.error(
        `Thunderstorm outlook not found for ID: ${outlookRefId}`,
      );
      return;
    } else {
      this.logger.log(
        '--- Start Generating Thunderstorm Outlook AI Summary ---',
      );
      this.ablyPublishToClient(
        NHISCHANNEL_EVENTS.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATING,
        outlook._id.toString(),
      );
      const ai_resps = await Promise.all(
        outlook.items.map((item) => {
          return this.invokeThunderstormChatCompletion(item.outlook);
        }),
      );
      this.logger.log('AI Summary generated.');
      const generatedAt = new Date();
      this.scrapeRepository.insertAiGeneratedThunderstormSummary({
        outlookRefId: outlook._id.toString(),
        genReason: reason,
        generatedAt: generatedAt,
        generatedAtISO:
          DateTime.fromJSDate(generatedAt)
            .setZone('Pacific/Auckland')
            .toISO() || '',
        content: ai_resps.map((summary, idx) => ({
          summary,
          date: outlook.items[idx].header,
        })),
      });
      this.logger.log('Collection: ai_thunderstorm_outlook_summary updated.');

      await this.ablyPublishToClient(
        NHISCHANNEL_EVENTS.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATED,
        outlook._id.toString(),
      );
    }
    this.logger.log('Channel message sent.');
    this.logger.log('--- End Generating AI Summary ---');
  }

  async invokeSevereWeatherChatCompletion(outlook: string) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.chat.completions.parse({
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      messages: [
        {
          role: 'system',
          content: severeWeatherSystemPrompt,
        },
        {
          role: 'user',
          content: createSevereWeatherUserPrompt(outlook),
        },
      ],
      response_format: zodResponseFormat(
        SevereWeatherAISummarySchema,
        'SevereWeatherAISummary',
      ),
    });
    return response.choices[0].message.parsed?.chanceOfUpgrade || [];
  }

  async invokeThunderstormChatCompletion(outlook: string) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.chat.completions.parse({
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      messages: [
        {
          role: 'system',
          content: thunderstormSystemPrompt,
        },
        {
          role: 'user',
          content: createThunderstormUserPrompt(outlook),
        },
      ],
      response_format: zodResponseFormat(
        ThunderstormAISummarySchema,
        'ThunderstormAISummary',
      ),
    });
    return response.choices[0].message.parsed?.outlooks || [];
  }

  private async ablyPublishToClient(name: string, data: string) {
    const ablyClient = new Rest({
      key: process.env.ABLY_API_KEY,
      clientId: 'nhis-mq',
    });
    const channel = ablyClient.channels.get(process.env.ABLY_CHANNEL_NAME!);
    await channel.publish(name, data);
  }
}
