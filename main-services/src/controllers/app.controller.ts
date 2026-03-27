import { Controller, Get } from '@nestjs/common';
import { AppService } from 'src/services/app.service';
import { ScrapeService } from 'src/services/scrape/scrape.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scrapeService: ScrapeService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('severe-weather')
  async getSevereWeatherOutlook() {
    const response = await this.scrapeService.getSevereWeatherOutlook();
    return response.json();
  }

  @Get('thunderstorm')
  async getThunderstormOutlook() {
    const response = await this.scrapeService.getThunderstormOutlook();
    return response.json();
  }
}
