import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrapeService {
  async getSevereWeatherOutlook() {
    return fetch('http://scrape-services:4000/severe-weather-outlook');
  }

  async getThunderstormOutlook() {
    return fetch('http://scrape-services:4000/thunderstorm-outlook');
  }
}
