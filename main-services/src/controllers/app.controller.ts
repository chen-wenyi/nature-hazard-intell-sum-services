import { Controller, Get, Query } from '@nestjs/common';
import { AiGenerateService } from 'src/services/ai-generate/ai-generate.service';
import { AppService } from 'src/services/app.service';
import { ScrapeService } from 'src/services/scrape/scrape.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scrapeService: ScrapeService,
    private readonly aiGenerateService: AiGenerateService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('update-severe-weather')
  async updateSevereWeatherOutlook() {
    await this.scrapeService.updateSevereWeatherOutlook();
    return { ok: true };
  }

  @Get('update-thunderstorm')
  async updateThunderstormOutlook() {
    await this.scrapeService.updateThunderstormOutlook();
    return { ok: true };
  }

  @Get('update-issued-alerts')
  async updateIssuedAlerts() {
    await this.scrapeService.updateIssuedAlerts();
    return { ok: true };
  }
  @Get('regen-ai-severe-weather-summary')
  async regenerateSevereWeatherSummary(
    @Query('reason') reason: string,
    @Query('outlookRefId') outlookRefId: string,
  ) {
    await this.aiGenerateService.generateSevereWeatherOutlookSummary(
      outlookRefId,
      reason,
    );
  }

  @Get('regen-ai-thunderstorm-summary')
  async regenerateThunderstormSummary(
    @Query('reason') reason: string,
    @Query('outlookRefId') outlookRefId: string,
  ) {
    await this.aiGenerateService.generateThunderstormOutlookSummary(
      outlookRefId,
      reason,
    );
  }
}
