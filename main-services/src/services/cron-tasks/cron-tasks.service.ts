import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapeService } from '../scrape/scrape.service';

interface CronTasks {
  handleSevereWeatherUpdateFrom9To11: () => Promise<void>;
  handleSevereWeatherUpdate: () => Promise<void>;
  handleThunderstormUpdate: () => Promise<void>;
  handleIssuedAlertsUpdate: () => Promise<void>;
}

@Injectable()
export class CronTasksService implements CronTasks {
  private readonly logger = new Logger(CronTasksService.name);

  constructor(private readonly scrapeService: ScrapeService) {}

  @Cron('*/10 20-21 * * *')
  async handleSevereWeatherUpdateFrom9To11() {
    await this.scrapeService.updateSevereWeatherOutlook();
    this.logger.log(
      'Executed cron task to update severe weather outlook(9-11)',
    );
  }

  @Cron('0 21-23,0-5 * * *')
  async handleSevereWeatherUpdate() {
    await this.scrapeService.updateSevereWeatherOutlook();
    this.logger.log('Executed cron task to update severe weather outlook');
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleThunderstormUpdate() {
    await this.scrapeService.updateThunderstormOutlook();
    this.logger.log('Executed cron task to update thunderstorm outlook');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleIssuedAlertsUpdate() {
    await this.scrapeService.updateIssuedAlerts();
    this.logger.log('Executed cron task to update issued alerts');
  }
}
